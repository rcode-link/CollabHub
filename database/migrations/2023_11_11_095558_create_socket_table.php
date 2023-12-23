<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       DB::raw("CREATE TABLE IF NOT EXISTS `apps` (
    `id` varchar(255) NOT NULL,
    `key` varchar(255) NOT NULL,
    `secret` varchar(255) NOT NULL,
    `max_connections` integer(10) NOT NULL,
    `enable_client_messages` tinyint(1) NOT NULL,
    `enabled` tinyint(1) NOT NULL,
    `max_backend_events_per_sec` integer(10) NOT NULL,
    `max_client_events_per_sec` integer(10) NOT NULL,
    `max_read_req_per_sec` integer(10) NOT NULL,
    `webhooks` json,
    `max_presence_members_per_channel` tinyint(1) NULL,
    `max_presence_member_size_in_kb` tinyint(1) NULL,
    `max_channel_name_length` tinyint(1) NULL,
    `max_event_channels_at_once` tinyint(1) NULL,
    `max_event_name_length` tinyint(1) NULL,
    `max_event_payload_in_kb` tinyint(1) NULL,
    `max_event_batch_size` tinyint(1) NULL,
    `enable_user_authentication` tinyint(1) NOT NULL,
    PRIMARY KEY (`id`)
);");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apps');
    }
};
