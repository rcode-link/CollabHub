const Ziggy = {
    "url": "http:\/\/localhost", "port": null, "defaults": {}, "routes": {
        "scramble.docs.index": {"uri": "docs\/api.json", "methods": ["GET", "HEAD"]},
        "scramble.docs.api": {"uri": "docs\/api", "methods": ["GET", "HEAD"]},
        "sanctum.csrf-cookie": {"uri": "sanctum\/csrf-cookie", "methods": ["GET", "HEAD"]},
        "telescope": {
            "uri": "telescope\/{view?}",
            "methods": ["GET", "HEAD"],
            "wheres": {"view": "(.*)"},
            "parameters": ["view"]
        },
        "ignition.healthCheck": {"uri": "_ignition\/health-check", "methods": ["GET", "HEAD"]},
        "ignition.executeSolution": {"uri": "_ignition\/execute-solution", "methods": ["POST"]},
        "ignition.updateConfig": {"uri": "_ignition\/update-config", "methods": ["POST"]},
        "permissions.index": {"uri": "api\/v1\/permissions", "methods": ["GET", "HEAD"]},
        "permissions.store": {"uri": "api\/v1\/permissions", "methods": ["POST"]},
        "permissions.show": {
            "uri": "api\/v1\/permissions\/{permission}",
            "methods": ["GET", "HEAD"],
            "parameters": ["permission"],
            "bindings": {"permission": "id"}
        },
        "permissions.update": {
            "uri": "api\/v1\/permissions\/{permission}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["permission"],
            "bindings": {"permission": "id"}
        },
        "permissions.destroy": {
            "uri": "api\/v1\/permissions\/{permission}",
            "methods": ["DELETE"],
            "parameters": ["permission"],
            "bindings": {"permission": "id"}
        },
        "companies.index": {"uri": "api\/v1\/companies", "methods": ["GET", "HEAD"]},
        "companies.store": {"uri": "api\/v1\/companies", "methods": ["POST"]},
        "companies.show": {
            "uri": "api\/v1\/companies\/{company}",
            "methods": ["GET", "HEAD"],
            "parameters": ["company"],
            "bindings": {"company": "id"}
        },
        "companies.update": {
            "uri": "api\/v1\/companies\/{company}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["company"],
            "bindings": {"company": "id"}
        },
        "companies.destroy": {
            "uri": "api\/v1\/companies\/{company}",
            "methods": ["DELETE"],
            "parameters": ["company"],
            "bindings": {"company": "id"}
        },
        "invite.index": {"uri": "api\/v1\/company\/invite", "methods": ["GET", "HEAD"]},
        "invite.store": {"uri": "api\/v1\/company\/invite", "methods": ["POST"]},
        "invite.show": {
            "uri": "api\/v1\/company\/invite\/{invite}",
            "methods": ["GET", "HEAD"],
            "parameters": ["invite"]
        },
        "invite.update": {
            "uri": "api\/v1\/company\/invite\/{invite}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["invite"]
        },
        "invite.destroy": {
            "uri": "api\/v1\/company\/invite\/{invite}",
            "methods": ["DELETE"],
            "parameters": ["invite"],
            "bindings": {"invite": "id"}
        },
        "reactions.index": {"uri": "api\/v1\/messages\/reactions", "methods": ["GET", "HEAD"]},
        "reactions.store": {"uri": "api\/v1\/messages\/reactions", "methods": ["POST"]},
        "reactions.show": {
            "uri": "api\/v1\/messages\/reactions\/{reaction}",
            "methods": ["GET", "HEAD"],
            "parameters": ["reaction"]
        },
        "reactions.update": {
            "uri": "api\/v1\/messages\/reactions\/{reaction}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["reaction"]
        },
        "reactions.destroy": {
            "uri": "api\/v1\/messages\/reactions\/{reaction}",
            "methods": ["DELETE"],
            "parameters": ["reaction"]
        },
        "chats.index": {"uri": "api\/v1\/chats", "methods": ["GET", "HEAD"]},
        "chats.store": {"uri": "api\/v1\/chats", "methods": ["POST"]},
        "chats.show": {
            "uri": "api\/v1\/chats\/{chat}",
            "methods": ["GET", "HEAD"],
            "parameters": ["chat"],
            "bindings": {"chat": "id"}
        },
        "chats.update": {
            "uri": "api\/v1\/chats\/{chat}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["chat"],
            "bindings": {"chat": "id"}
        },
        "chats.destroy": {
            "uri": "api\/v1\/chats\/{chat}",
            "methods": ["DELETE"],
            "parameters": ["chat"],
            "bindings": {"chat": "id"}
        },
        "projects.index": {"uri": "api\/v1\/projects", "methods": ["GET", "HEAD"]},
        "projects.store": {"uri": "api\/v1\/projects", "methods": ["POST"]},
        "projects.show": {
            "uri": "api\/v1\/projects\/{project}",
            "methods": ["GET", "HEAD"],
            "parameters": ["project"],
            "bindings": {"project": "id"}
        },
        "projects.update": {
            "uri": "api\/v1\/projects\/{project}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["project"],
            "bindings": {"project": "id"}
        },
        "projects.destroy": {
            "uri": "api\/v1\/projects\/{project}",
            "methods": ["DELETE"],
            "parameters": ["project"],
            "bindings": {"project": "id"}
        },
        "task-types.index": {"uri": "api\/v1\/task-types", "methods": ["GET", "HEAD"]},
        "task-types.store": {"uri": "api\/v1\/task-types", "methods": ["POST"]},
        "task-types.show": {
            "uri": "api\/v1\/task-types\/{task_type}",
            "methods": ["GET", "HEAD"],
            "parameters": ["task_type"]
        },
        "task-types.update": {
            "uri": "api\/v1\/task-types\/{task_type}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["task_type"]
        },
        "task-types.destroy": {
            "uri": "api\/v1\/task-types\/{task_type}",
            "methods": ["DELETE"],
            "parameters": ["task_type"]
        },
        "relations.index": {"uri": "api\/v1\/task\/relations", "methods": ["GET", "HEAD"]},
        "relations.store": {"uri": "api\/v1\/task\/relations", "methods": ["POST"]},
        "relations.show": {
            "uri": "api\/v1\/task\/relations\/{relation}",
            "methods": ["GET", "HEAD"],
            "parameters": ["relation"]
        },
        "relations.update": {
            "uri": "api\/v1\/task\/relations\/{relation}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["relation"]
        },
        "relations.destroy": {
            "uri": "api\/v1\/task\/relations\/{relation}",
            "methods": ["DELETE"],
            "parameters": ["relation"]
        },
        "tasks.index": {"uri": "api\/v1\/tasks", "methods": ["GET", "HEAD"]},
        "tasks.store": {"uri": "api\/v1\/tasks", "methods": ["POST"]},
        "tasks.show": {"uri": "api\/v1\/tasks\/{task}", "methods": ["GET", "HEAD"], "parameters": ["task"]},
        "tasks.update": {"uri": "api\/v1\/tasks\/{task}", "methods": ["PUT", "PATCH"], "parameters": ["task"]},
        "tasks.destroy": {
            "uri": "api\/v1\/tasks\/{task}",
            "methods": ["DELETE"],
            "parameters": ["task"],
            "bindings": {"task": "id"}
        },
        "tasks-statuses.index": {"uri": "api\/v1\/tasks-statuses", "methods": ["GET", "HEAD"]},
        "tasks-statuses.store": {"uri": "api\/v1\/tasks-statuses", "methods": ["POST"]},
        "tasks-statuses.show": {
            "uri": "api\/v1\/tasks-statuses\/{tasks_status}",
            "methods": ["GET", "HEAD"],
            "parameters": ["tasks_status"]
        },
        "tasks-statuses.update": {
            "uri": "api\/v1\/tasks-statuses\/{tasks_status}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["tasks_status"]
        },
        "tasks-statuses.destroy": {
            "uri": "api\/v1\/tasks-statuses\/{tasks_status}",
            "methods": ["DELETE"],
            "parameters": ["tasks_status"]
        },
        "boards.index": {"uri": "api\/v1\/boards", "methods": ["GET", "HEAD"]},
        "boards.store": {"uri": "api\/v1\/boards", "methods": ["POST"]},
        "boards.show": {
            "uri": "api\/v1\/boards\/{board}",
            "methods": ["GET", "HEAD"],
            "parameters": ["board"],
            "bindings": {"board": "id"}
        },
        "boards.update": {
            "uri": "api\/v1\/boards\/{board}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["board"],
            "bindings": {"board": "id"}
        },
        "boards.destroy": {
            "uri": "api\/v1\/boards\/{board}",
            "methods": ["DELETE"],
            "parameters": ["board"],
            "bindings": {"board": "id"}
        },
        "sprints.index": {"uri": "api\/v1\/sprints", "methods": ["GET", "HEAD"]},
        "sprints.store": {"uri": "api\/v1\/sprints", "methods": ["POST"]},
        "sprints.show": {
            "uri": "api\/v1\/sprints\/{sprint}",
            "methods": ["GET", "HEAD"],
            "parameters": ["sprint"],
            "bindings": {"sprint": "id"}
        },
        "sprints.update": {
            "uri": "api\/v1\/sprints\/{sprint}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["sprint"],
            "bindings": {"sprint": "id"}
        },
        "sprints.destroy": {
            "uri": "api\/v1\/sprints\/{sprint}",
            "methods": ["DELETE"],
            "parameters": ["sprint"],
            "bindings": {"sprint": "id"}
        },
        "files.index": {"uri": "api\/v1\/files", "methods": ["GET", "HEAD"]},
        "files.store": {"uri": "api\/v1\/files", "methods": ["POST"]},
        "files.show": {"uri": "api\/v1\/files\/{file}", "methods": ["GET", "HEAD"], "parameters": ["file"]},
        "files.update": {"uri": "api\/v1\/files\/{file}", "methods": ["PUT", "PATCH"], "parameters": ["file"]},
        "files.destroy": {
            "uri": "api\/v1\/files\/{file}",
            "methods": ["DELETE"],
            "parameters": ["file"],
            "bindings": {"file": "id"}
        },
        "time-sheet.index": {"uri": "api\/v1\/time-sheet", "methods": ["GET", "HEAD"]},
        "time-sheet.store": {"uri": "api\/v1\/time-sheet", "methods": ["POST"]},
        "time-sheet.show": {
            "uri": "api\/v1\/time-sheet\/{time_sheet}",
            "methods": ["GET", "HEAD"],
            "parameters": ["time_sheet"]
        },
        "time-sheet.update": {
            "uri": "api\/v1\/time-sheet\/{time_sheet}",
            "methods": ["PUT", "PATCH"],
            "parameters": ["time_sheet"]
        },
        "time-sheet.destroy": {
            "uri": "api\/v1\/time-sheet\/{time_sheet}",
            "methods": ["DELETE"],
            "parameters": ["time_sheet"]
        },
        "invite.user": {"uri": "register", "methods": ["GET", "HEAD"]},
        "register": {"uri": "register\/company", "methods": ["POST"]},
        "login": {"uri": "login", "methods": ["GET", "HEAD"]}
    }
};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}

export {Ziggy};
