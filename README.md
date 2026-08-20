# 식단 기록 앱

두 사람이 함께 쓰는 식단 앱입니다. 주간표는 예정 식단을 작성하고, 캘린더는 실제 식단 기록을 남깁니다. 두 데이터는 서로 공유하지 않습니다.

Next.js App Router, TypeScript, Tailwind CSS로 만들었고 Supabase 연결 전에는 개발용 로컬 JSON 저장소를 사용합니다.

## 실행

```bash
npm run dev
```

로그인 비밀번호는 `.env.local`의 `APP_PASSWORD` 값을 사용합니다.

## Supabase 연결

1. Supabase에서 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase-schema.sql`을 실행합니다.
3. `.env.local`에 값을 채웁니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
AUTH_SECRET=충분히-긴-랜덤-문자열
```

Supabase URL과 키가 비어 있으면 식단 기록은 `data/meals.json`, 주간 예정표는 `data/weekly-plans.json`에 저장됩니다.
