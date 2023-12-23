<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\VideoCallController;
use App\Http\Middleware\SignedRouteMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Sabre\DAV;

Route::match(['PROPFIND', 'GET', "POST"], '/caldav/{path?}', function () {
    // Specify your data directory
    $dataDir = storage_path('app/caldav_data');
    $principalBackend = new Sabre\DAVACL\PrincipalBackend\PDO(DB::getPdo());
    // Initialize the CalDAV server
    $server = new DAV\Server([
        new DAV\FS\Directory($dataDir),
    ]);

    // Enable the CalDAV plugin
    $calDav = new Sabre\CalDAV\Plugin();
    $server->addPlugin($calDav);

    // Execute the server
    $server->exec();
});
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

Route::get('/storage/{media}/{slug}', function (Request $request, \Spatie\MediaLibrary\MediaCollections\Models\Media $media) {
    return response()->file($media->getPath(), ["Content-Type" => $media->mime_type]);
});

Route::match(['PROPFIND', 'GET'], '/calendar', [CalendarController::class, 'calDav'])->middleware('auth.basic');

Route::get('/video-call/{video}/join', [VideoCallController::class, 'getVideoCallToken']);

Route::middleware([\App\Http\Middleware\FrontendEnv::class])->group(function () {
    Route::view('/', 'welcome');

    Route::resource('/auth', AuthenticatedSessionController::class)->except('index', 'show');

    Route::get('/register', function (Request $request) {

        return view('welcome');
    })->name('invite.user')->middleware(SignedRouteMiddleware::class);

    Route::post('/register/company', \App\Http\Controllers\RegisterController::class)->name('register');
    Route::view('/login', 'welcome')->name('login');


    Route::view('*', 'welcome');
    Route::fallback(function () {
        return view('welcome');
    });

});

