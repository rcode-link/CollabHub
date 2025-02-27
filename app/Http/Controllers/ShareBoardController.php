<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;

class ShareBoardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $board = Board::findOrFail($request->get('board_id'));

        // Check if the authenticated user has permission to view tokens for this board
        if ($request->user()->cannot('viewTokens', $board)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get all tokens for this board
        $tokens = $board->tokens()->get()->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
                'expires_at' => $token->expires_at,
            ];
        });
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
