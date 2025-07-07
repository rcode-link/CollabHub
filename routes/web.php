<?php

use App\Helpers\GenerateImage;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\VideoCallController;
use App\Http\Middleware\SignedRouteMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Well-known URIs for service discovery
Route::get('/.well-known/caldav', function () {
    $response = '<?xml version="1.0" encoding="utf-8" ?>
        <d:service xmlns:d="DAV:">
            <d:href>/cal/principals/user1/</d:href>
        </d:service>';

    return response($response, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
});

Route::get('/.well-known/carddav', function () {
    return response('', 404);
});

// Principal resources
Route::any('/cal/principals/{path?}', function (Request $request, $path = null) {
    try {
        $method = $request->server('REQUEST_METHOD');

        // Enhanced method detection for WebDAV
        if ($method === 'POST') {
            $contentType = $request->header('Content-Type');
            $body = $request->getContent();

            if (strpos($contentType, 'application/xml') !== false || strpos($contentType, 'text/xml') !== false) {
                if (strpos($body, 'PROPFIND') !== false) {
                    $method = 'PROPFIND';
                }
            }
        }

        if ($method === 'PROPFIND') {
            return app()->call('App\Http\Controllers\CalDAVController@principalPropfind', ['request' => $request]);
        }

        if ($method === 'GET') {
            return app()->call('App\Http\Controllers\CalDAVController@principalGet', ['path' => $path]);
        }

        // Handle OPTIONS requests
        if ($method === 'OPTIONS') {
            return response('', 200, [
                'DAV' => '1, 2, 3, calendar-access, addressbook, extended-mkcol',
                'Allow' => 'OPTIONS, GET, HEAD, POST, DELETE, PROPFIND, PROPPATCH, COPY, MOVE, REPORT, MKCOL',
                'Content-Length' => '0'
            ]);
        }

        return response('Method not allowed', 405);
    } catch (MethodNotAllowedHttpException $e) {
        $method = $request->server('REQUEST_METHOD');
        if (in_array($method, ['PROPFIND', 'REPORT', 'MKCOL', 'PROPPATCH', 'COPY', 'MOVE'])) {
            switch ($method) {
                case 'PROPFIND':
                    return app()->call('App\Http\Controllers\CalDAVController@principalPropfind', ['request' => $request]);
                default:
                    return response('Method not implemented', 501);
            }
        }
        throw $e;
    }
})->where('path', '.*');

// Calendar resources
Route::any('/cal/calendar/{path?}', function (Request $request, $path = null) {
    try {
        \Log::info('Request URL: ' . $request->fullUrl());
        \Log::info('Request Method: ' . $request->method());
        \Log::info('Request Headers: ', $request->header());
        \Log::info('Request Body: ' . $request->getContent());

        $method = $request->server('REQUEST_METHOD');

        // Enhanced method detection for WebDAV
        if ($method === 'POST') {
            $contentType = $request->header('Content-Type');
            $body = $request->getContent();

            if (strpos($contentType, 'application/xml') !== false || strpos($contentType, 'text/xml') !== false) {
                if (strpos($body, 'PROPFIND') !== false) {
                    $method = 'PROPFIND';
                } elseif (strpos($body, 'REPORT') !== false) {
                    $method = 'REPORT';
                } elseif (strpos($body, 'MKCOL') !== false) {
                    $method = 'MKCOL';
                }
            }

            // Also check for depth header which is common with PROPFIND
            if ($request->hasHeader('Depth')) {
                $method = 'PROPFIND';
            }
        }

        // Check for X-HTTP-Method-Override header
        if ($request->hasHeader('X-HTTP-Method-Override')) {
            $method = $request->header('X-HTTP-Method-Override');
        }

        // Log the detected method
        \Log::info('Detected Method: ' . $method);

        // Handle HEAD requests
        if ($method === 'HEAD') {
            return app()->call('App\Http\Controllers\CalDAVController@head', ['path' => $path, 'request' => $request]);
        }

        // Handle OPTIONS requests
        if ($method === 'OPTIONS') {
            return app()->call('App\Http\Controllers\CalDAVController@options', ['request' => $request]);
        }

        // Handle PROPFIND requests
        if ($method === 'PROPFIND') {
            return app()->call('App\Http\Controllers\CalDAVController@propfind', ['request' => $request]);
        }

        switch ($method) {
            case 'PUT':
                return app()->call('App\Http\Controllers\CalDAVController@put', ['path' => $path, 'request' => $request]);
            case 'GET':
                return app()->call('App\Http\Controllers\CalDAVController@get', ['path' => $path]);
            case 'DELETE':
                return app()->call('App\Http\Controllers\CalDAVController@delete', ['path' => $path]);
            case 'REPORT':
                return app()->call('App\Http\Controllers\CalDAVController@report', ['path' => $path, 'request' => $request]);
            case 'MKCOL':
                return app()->call('App\Http\Controllers\CalDAVController@mkcol', ['path' => $path, 'request' => $request]);
            default:
                return response('Method not allowed', 405);
        }
    } catch (MethodNotAllowedHttpException $e) {
        // If we get a MethodNotAllowedHttpException, check if the method is one we want to handle
        $method = $request->server('REQUEST_METHOD');
        if (in_array($method, ['PROPFIND', 'REPORT', 'MKCOL', 'PROPPATCH', 'COPY', 'MOVE'])) {
            // Handle these methods here
            switch ($method) {
                case 'PROPFIND':
                    return app()->call('App\Http\Controllers\CalDAVController@propfind', ['request' => $request]);
                case 'REPORT':
                    return app()->call('App\Http\Controllers\CalDAVController@report', ['path' => $path, 'request' => $request]);
                case 'MKCOL':
                    return app()->call('App\Http\Controllers\CalDAVController@mkcol', ['path' => $path, 'request' => $request]);
                    // Add other WebDAV methods as needed
                default:
                    return response('Method not implemented', 501);
            }
        }
        // If it's not a method we handle, rethrow the exception
        throw $e;
    }
})->where('path', '.*');

Route::match(['PROPFIND', 'GET'], '/calendar', [CalendarController::class, 'calDav'])->middleware('auth.basic');

Route::get('/video-call/{video}/join', [VideoCallController::class, 'getVideoCallToken']);

Route::post('/login', function () {});
Route::get('/test', function () {

    GenerateImage::profileImage("Radan Stupar")->toPng()->save(public_path('foo.png'));
    return  'ok';

    // $company = Company::whereIsCostumerCompany(false)->firstOrFail();
    // return view('pdf.invoice', ['model' => $invoice, 'company' => $company]);
});


Route::middleware([\App\Http\Middleware\FrontendEnv::class])->group(function () {

    Route::view('/', 'welcome');

    Route::resource('/auth', AuthenticatedSessionController::class)->except('index', 'show');

    Route::get('/register', function (Request $request) {

        return view('welcome');
    })->name('invite.user')->middleware(SignedRouteMiddleware::class);

    Route::post('/register/company', \App\Http\Controllers\RegisterController::class)->name('register');
    Route::view('/login', 'welcome')->name('login');

    Route::fallback(function () {
        return view('welcome');
    });
});
