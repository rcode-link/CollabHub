<?php

use App\Events\EditorCollabEvent;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatMessageController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CompanyUsersController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\InvitationsController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\MessageReactionController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PusherController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskRelationController;
use App\Http\Controllers\TaskStatusesController;
use App\Http\Controllers\TaskTypeController;
use App\Http\Controllers\TimeSheetController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VacationRequestController;
use App\Http\Controllers\VideoCallController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CustomerCompanyController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ShareBoardController;
use App\Http\Controllers\BillingItemController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\InvoiceDataController;
use App\Http\Controllers\InvoiceItemController;
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware(['auth:sanctum'])->group(function () {

    Route::apiResource('/share/board/', ShareBoardController::class);

    Route::get('/user', [ProfileController::class, 'view'])->name('api.view');
    Route::put('/user', [ProfileController::class, 'update'])->name('api.update');
    Route::get('/dashboard/messages', [DashboardController::class, 'unreadMessages'])->name('api.unreadMessages');
    Route::get('/dashboard/tasks', [DashboardController::class, 'openTasks'])->name('api.openTasks');
    Route::get('/get-organization-keys', [CompanyController::class, 'getKeys'])->name('api.getKeys');
    Route::post('/user/update-profile-picture', [ProfileController::class, 'updateProfilePicture'])->name('api.updateProfilePicture');
    Route::get('/permissions/my', [PermissionController::class, 'myPermissions'])->name('api.myPermissions');
    Route::apiResource('/permissions', PermissionController::class);
    Route::apiResource('/companies', CompanyController::class);
    Route::post('/companies/{company}', [CompanyController::class, 'update'])->name('api.companies.update');
    Route::get('/company/users/{company}', [CompanyUsersController::class, 'index'])->name('api.index');
    Route::post('/company/users/invite', [CompanyUsersController::class, 'invite'])->name('api.invite');
    Route::apiResource('/company/invite', InvitationsController::class);
    Route::get('/chats/number-of-unread-messages', [ChatController::class, 'getNumberOfUnreadMessages'])->name('api.getNumberOfUnreadMessages');
    Route::get('/chats/{chat}/messages', [ChatMessageController::class, 'index'])->name('api.messages.index');
    Route::post('/chats/{chat}/message', [ChatMessageController::class, 'store'])->name('api.messages.store');
    Route::delete('/messages/{id}', [ChatMessageController::class, 'destroy'])->name('api.messages.destroy');
    Route::post('/video-call/{chat}/start', [VideoCallController::class, 'startVideoCall'])->name('api.startVideoCall');
    Route::apiResource('/messages/reactions', MessageReactionController::class);
    Route::apiResource('/chats', ChatController::class);
    Route::apiResource('/projects', ProjectController::class);
    Route::apiResource('/task-types', TaskTypeController::class);
    Route::get('/task/load/{task}/relations/', [TaskController::class, 'getRelations'])->name('api.getRelations');
    Route::apiResource('/task/relations', TaskRelationController::class);
    Route::put('/sprint/tasks', [TaskController::class, 'addTaskToSprint'])->name('api.addTaskToSprint');
    Route::delete('/sprint/tasks', [TaskController::class, 'removeFromSPrint'])->name('api.removeFromSPrint');
    Route::get('/sprint/tasks', [TaskController::class, 'tasksForSprint'])->name('api.tasksForSprint');
    Route::put('/tasks/change-status', [TaskController::class, 'changeTaskStatus'])->name('api.changeTaskStatus');
    Route::get('/tasks/search', [TaskController::class, 'search'])->name('api.search');
    Route::apiResource('/tasks', TaskController::class);
    Route::apiResource('/tasks-statuses', TaskStatusesController::class);
    Route::get('/users/project', [ProjectController::class, 'getProjectUsers'])->name('api.getProjectUsers');
    Route::apiResource('/boards', BoardController::class);
    Route::put('/sprints/{sprint}/activate', [SprintController::class, 'activate'])->name('api.activate');
    Route::apiResource('/sprints', SprintController::class);
    Route::post('/file-to-pdf', [FileController::class, 'exportPDF']);
    Route::apiResource('/files', FileController::class);
    Route::get('/role/resources', [RoleController::class, 'getResource'])->name('api.getResource');
    Route::get('/role/resources/{role}', [RoleController::class, 'getAllResources'])->name('api.getAllResources');
    Route::post('/role/resources/{role}', [RoleController::class, 'addResource'])->name('api.addResource');
    Route::put('/roles/detach/users/{role}', [RoleController::class, 'removeUserFromRole'])->name('api.removeUserFromRole');
    Route::apiResource('/roles', RoleController::class);

    Route::apiResource('/time-sheet', TimeSheetController::class);
    Route::get('/calendar', [CalendarController::class, 'getMyEvents'])->name('api.calendar.myEvents');
    Route::post('/calendar', [CalendarController::class, 'insertCalendarItem'])->name('api.calendar.insertCalendarItem');
    Route::put('/calendar/{event}', [CalendarController::class, 'update'])->name('api.calendar.update');
    Route::get('/event/{event}', [CalendarController::class, 'view'])->name('api.event.view');
    Route::put('/event/{event}', EventController::class)->name('api.calendar.updateEvent');
    Route::delete('/calendar/{event}', [CalendarController::class, 'destroy'])->name('api.destroy');
    Route::apiResource('/users', UserController::class);
    Route::put('/user/change-password', [UserController::class, 'updatePassword'])->name('api.updatePassword');
    Route::put('/vacation/{event}', VacationRequestController::class)->name('api.vacation.event');

    Route::apiResource('/customers', CustomerCompanyController::class);
    Route::apiResource('/invoices-items', InvoiceItemController::class);
    Route::get('/invoices/{invoice}/download', [InvoiceController::class, 'download']);
    Route::apiResource('/invoices', InvoiceController::class);
    Route::apiResource('/payments', PaymentController::class);
    Route::apiResource('/currency', CurrencyController::class);
    Route::apiResource('/billing-items', BillingItemController::class);
    Route::apiResource('/invoice/data', InvoiceDataController::class);


    Route::post('/collaboration/{document}', function ($document) {
        EditorCollabEvent::dispatch(request()->all(), $document);
        return response()->noContent();
    });

    Route::post('/chat/{id}/present', [ChatController::class, 'present']);
    Route::post('/chat/{id}/left', [ChatController::class, 'left']);

    \App\Helpers\Socket\BroadcastCustom::route();
});
Route::post('/register', RegisterController::class)->name('api.register');
Route::post('/login', LoginController::class)->name('api.login');
Route::get('/video-call/{video}/join', [VideoCallController::class, 'getVideoCallToken'])->name('api.get.getVideoCallToken');
Route::put('/video-call/{video}/join', [VideoCallController::class, 'getVideoCallToken'])->name('api.put.getVideoCallToken');
Route::post('/webhook', [PusherController::class, 'webhook'])->name('api.webhook');
