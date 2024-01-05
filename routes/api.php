<?php

use App\Helpers\CalDavHelper;
use App\Http\Controllers\{BoardController,
    CalendarController,
    ChatController,
    ChatMessageController,
    CompanyController,
    CompanyUsersController,
    DashboardController,
    FileController,
    InvitationsController,
    LoginController,
    MessageReactionController,
    PermissionController,
    ProfileController,
    ProjectController,
    PusherController,
    RegisterController,
    RoleController,
    SprintController,
    TaskController,
    TaskRelationController,
    TaskStatusesController,
    TaskTypeController,
    TimeSheetController,
    UserController,
    VideoCallController};
use Illuminate\Http\Request;
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
    Route::get('/user', [ProfileController::class, 'view']);
    Route::put('/user', [ProfileController::class, 'update']);
    Route::get('/dashboard/messages', [DashboardController::class, 'unreadMessages']);
    Route::get('/dashboard/tasks', [DashboardController::class, 'openTasks']);
    Route::get('/get-organization-keys', [CompanyController::class, 'getKeys']);
    Route::post('/user/update-profile-picture', [ProfileController::class, 'updateProfilePicture']);
    Route::get('/permissions/my', [PermissionController::class, 'myPermissions']);
    Route::apiResource('/permissions', PermissionController::class);
    Route::apiResource('/companies', CompanyController::class);
    Route::post('/companies/{company}', [CompanyController::class, 'update']);
    Route::get('/company/users/{company}', [CompanyUsersController::class, 'index']);
    Route::post('/company/users/invite', [CompanyUsersController::class, 'invite']);
    Route::apiResource('/company/invite', InvitationsController::class);
    Route::get('/chats/number-of-unread-messages', [ChatController::class, 'getNumberOfUnreadMessages']);
    Route::get('/chats/{chat}/messages', [ChatMessageController::class, 'index']);
    Route::post('/chats/{chat}/message', [ChatMessageController::class, 'store']);
    Route::delete('/messages/{id}', [ChatMessageController::class, 'destroy']);
    Route::post('/video-call/{chat}/start', [VideoCallController::class, 'startVideoCall']);
    Route::apiResource('/messages/reactions', MessageReactionController::class);
    Route::apiResource('/chats', ChatController::class);
    Route::put('/projects/{project}/add-user', [ProjectController::class, 'addUsers']);
    Route::apiResource('/projects', ProjectController::class);
    Route::apiResource('/task-types', TaskTypeController::class);
    Route::get('/task/load/{task}/relations/', [TaskController::class, 'getRelations']);
    Route::apiResource('/task/relations', TaskRelationController::class);
    Route::put('/sprint/tasks', [TaskController::class, 'addTaskToSprint']);
    Route::delete('/sprint/tasks', [TaskController::class, 'removeFromSPrint']);
    Route::get('/sprint/tasks', [TaskController::class, 'tasksForSprint']);
    Route::put('/tasks/change-status', [TaskController::class, 'changeTaskStatus']);
    Route::get('/tasks/search', [TaskController::class, 'search']);
    Route::apiResource('/tasks', TaskController::class);
    Route::apiResource('/tasks-statuses', TaskStatusesController::class);
    Route::get('/users/project', [ProjectController::class, 'getProjectUsers']);
    Route::apiResource('/boards', BoardController::class);
    Route::put('/sprints/{sprint}/activate', [SprintController::class, 'activate']);
    Route::apiResource('/sprints', SprintController::class);
    Route::apiResource('/files', FileController::class);
    Route::get('/role/resources', [RoleController::class, 'getResource']);
    Route::get('/role/resources/{role}', [RoleController::class, 'getAllResources']);
    Route::post('/role/resources/{role}', [RoleController::class, 'addResource']);
    Route::put('/roles/detach/users/{role}', [RoleController::class, 'removeUserFromRole']);
    Route::apiResource('/roles', RoleController::class);

    Route::apiResource('/time-sheet', TimeSheetController::class);
    Route::get('/calendar', [CalendarController::class, 'getMyEvents']);
    Route::post('/calendar', [CalendarController::class, 'insertCalendarItem']);
    Route::put('/calendar/{event}', [CalendarController::class, 'update']);
    Route::delete('/calendar/{event}', [CalendarController::class, 'destroy']);
    Route::apiResource('/users', UserController::class);
    \App\Helpers\Socket\BroadcastCustom::route();
});
Route::post('/register', RegisterController::class);
Route::post('/login', LoginController::class);
Route::get('/video-call/{video}/join', [VideoCallController::class, 'getVideoCallToken']);
Route::put('/video-call/{video}/join', [VideoCallController::class, 'getVideoCallToken']);
Route::post('/webhook', [PusherController::class, 'webhook']);
