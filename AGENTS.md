# Agent Skills

This project uses skills installed globally.

## Core Rules
- If a task matches a skill, invoke it with the `skill` tool before acting.
- Follow the skill workflow strictly.

## Intent → Skill Mapping
- New feature / API endpoint → `api-contract`, then `test-driven-development`
- Bug / unexpected behavior → `systematic-debugging`
- Code review → `staff-engineer-review`
- Docker / deployment → `docker-optimize`, `deploy`
- Frontend UI work → `frontend-design`
- Database work → `database-design`
- Security concern → `code-security-auditor`
- Performance issue → `performance-profile`

## Execution Model
For every request:
1. Check if any skill applies.
2. Load it with `skill({ name: "<skill-name>" })`.
3. Follow the skill workflow.
4. Only proceed to implementation once required steps are complete.

## Project layout
- `frontend/` — Next.js 14 App Router app, deployed to Vercel.
- `backend/` — FastAPI + yt-dlp + ffmpeg, deployed to Render (Docker).

## Project commands
- Backend tests: `cd backend; ../.venv/Scripts/python.exe -m pytest` (Windows) or `cd backend; uv run pytest` (backend Python deps are in `backend/requirements.txt`; local venv at repo root via uv).
- Frontend typecheck: `cd frontend; npm run typecheck`
- Frontend build: `cd frontend; npm run build`
- Backend local run: `cd backend; uvicorn main:app --reload`   