# Neuroljus Care Command Protocol v0

Neuroljus Care Command Protocol v0 turns caregiver-authored care knowledge into portable command envelopes for future assistive devices, research tools, and local care environments.

The protocol begins in daily care. A caregiver defines the scenario, care goal, environment targets, allowed commands, safety exceptions, and audit policy. Adapters can then translate the same envelope to ROS2, MQTT, local HTTP, or offline review tools.

## Core Envelope

```json
{
  "envelope": "neuroljus.care_command.v0",
  "target": "ros2",
  "route": "/neuroljus/care_command",
  "command": "lower_light",
  "scenario": "evening_transition",
  "routine": "Evening transition",
  "care_goal": "Move from activity to rest with a predictable, low-stimulus routine.",
  "environment_targets": {
    "light": 35,
    "sound": 25,
    "distance": 1.5,
    "pace": "slow"
  },
  "safety_exceptions": [
    "rejection_signal",
    "caregiver_pause",
    "timeout",
    "unknown_event"
  ],
  "audit_required": true
}
```

## Allowed Commands

| Command | Intent |
| --- | --- |
| `lower_light` | Move room light toward caregiver target. |
| `reduce_sound` | Move sound load toward caregiver target. |
| `step_back` | Increase personal space. |
| `pause_interaction` | Hold interaction pressure. |
| `offer_visual_card` | Present a visual routine support card. |
| `notify_caregiver` | Send a caregiver notice. |
| `log_observation` | Preserve a local audit entry. |

## Safety Exceptions

| Exception | Expected Adapter Behavior |
| --- | --- |
| `rejection_signal` | Pause or escalate according to the configured routine. |
| `unusual_movement` | Stop active interaction and request review. |
| `caregiver_pause` | Pause immediately and wait for caregiver resume. |
| `timeout` | End the routine or request review. |
| `unknown_event` | Record context and avoid adding new commands outside the routine. |

## Adapter Targets

| Target | Route Example |
| --- | --- |
| ROS2 | Publish to `/neuroljus/care_command`. |
| MQTT | Publish to `neuroljus/care/command`. |
| HTTP | `POST http://localhost:8787/care-command`. |
| Offline | Export JSON for human review or field adaptation. |

## Invariants

- The caregiver authors routines, context, goals, allowed commands, and safety exceptions.
- Adapters preserve local audit records.
- Adapters preserve visible uncertainty and do not invent additional interpretation.
- Sensitive person data stays out of command envelopes unless a qualified research or care framework explicitly defines it.
- Clinical and diagnostic layers are future validated layers, built with qualified partners.

## Current Demo

The current implementation lives at:

`/labs/robot-interface`

It demonstrates scenario selection, preauthorized routine execution, visual care-room state, NL-VISION context import, local audit logs, generated protocol JSON, and adapter envelopes.
