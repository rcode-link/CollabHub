<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\VideoCallController;
use App\Http\Middleware\SignedRouteMiddleware;
use App\Models\Company;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use Spatie\Browsershot\Browsershot;
use Barryvdh\DomPDF\Facade\Pdf;

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

Route::get('/storage/{folder}/{media}/{slug}', function (Request $request, $media) {
    if ($media === 'images') {
        return response()->file(storage_path('/app/public/images/avatar.png'));
    }
    $media = Spatie\MediaLibrary\MediaCollections\Models\Media::find($media);
    return response()->file($media->getPath(), ["Content-Type" => $media->mime_type]);
});

Route::match(['PROPFIND', 'GET'], '/calendar', [CalendarController::class, 'calDav'])->middleware('auth.basic');

Route::get('/video-call/{video}/join', [VideoCallController::class, 'getVideoCallToken']);

Route::post('/login', function () {

});
Route::get('/generate-pdf-v2', function () {
    $invoice = Invoice::whereId(9)->with(['items', 'items.billingItem', 'company'])->firstOrFail();
    $company = Company::whereIsCostumerCompany(false)->firstOrFail();
    // $pdf = Pdf::loadView();
    return view('pdf.invoice', ['model' => $invoice, 'company' => $company]);
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

