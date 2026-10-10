# 학교 차량 예약

## 외부 접속 주소

https://byeolmuri-school-car.pudungsam.workers.dev

기존 예약 2건을 Cloudflare D1으로 이전했습니다. Supabase 운영 로그인 복귀 주소도 등록했습니다. 로컬 브라우저의 내 신청 관리 토큰은 다른 도메인으로 자동 이동하지 않으므로 이전 예약의 수정은 담당자 화면에서 진행할 수 있습니다.

## Cloudflare 배포

`npm run cf:build`로 OpenNext Workers 번들을 빌드하고 `npx wrangler deploy`로 배포합니다. Cloudflare 계정 인증이 필요합니다. `wrangler.jsonc`의 BOOKINGS_DB 바인딩과 BOOKING_STORAGE=d1 설정으로 예약을 D1에 영구 저장합니다. 로컬 개발은 기존 JSON 파일 저장을 사용합니다.

스키마는 `npx wrangler d1 migrations apply byeolmuri-school-car-bookings --remote`로 적용합니다. D1 저장은 버전 비교 후 갱신하는 방식으로 여러 요청의 쓰기 충돌을 재검사하며, 충돌한 예약이나 실패한 정기 수정은 저장하지 않습니다.

외부 배포에는 Cloudflare 비밀 환경변수 ADMIN_TOKEN이 필요합니다. 프로덕션에서 개발용 기본 비밀번호는 허용하지 않습니다. 운영 비밀번호는 로컬 .env.local에서 확인하고 GitHub에 커밋하지 마세요.

배포 주소가 정해지면 AUTH_URL을 해당 HTTPS 주소로 설정하고 Supabase Authentication Redirect URLs에 `배포주소/api/auth/callback`을 추가합니다. Google Cloud에 등록한 Supabase callback URL은 그대로 사용합니다.

Next.js App Router 기반 한국어 학교 차량 예약 서비스입니다. 일반 신청은 선착순으로 즉시 확정되며 승인 단계가 없습니다.

## 실행

## Supabase Google 로그인 설정

로그인 처리는 Supabase Auth를 사용합니다. 예약 데이터는 계속 로컬 파일에 저장합니다.

1. Supabase 프로젝트의 Settings에서 Project URL과 publishable 키(또는 anon 키)를 확인합니다.
2. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, AUTH_URL=http://127.0.0.1:3000 을 설정합니다. anon 키 사용 시 NEXT_PUBLIC_SUPABASE_ANON_KEY를 대신 설정할 수 있습니다. service_role 키는 로그인에 필요하지 않습니다.
3. Supabase Authentication의 Google Provider를 활성화하고 Google OAuth Client ID와 Secret을 Supabase 대시보드에 입력합니다.
4. Google OAuth 클라이언트의 승인된 리디렉션 URI에는 Supabase Google Provider 화면의 Callback URL(https://프로젝트주소/auth/v1/callback)을 등록합니다.
5. Supabase Authentication URL Configuration의 Site URL을 http://127.0.0.1:3000, Redirect URLs에 http://127.0.0.1:3000/api/auth/callback 을 추가합니다.
6. 개발 서버를 재시작합니다. Google 테스트 모드에서는 테스트 사용자를 추가해야 합니다.

로그인 성공 시 Google 이름이 새 예약 신청자에 자동 입력됩니다. 기존 예약 수정은 원래 이름을 유지합니다. 로그인은 선택 사항이며 내 신청의 관리 권한은 기존 브라우저 관리 토큰 방식을 유지합니다. Supabase 공식 SSR 클라이언트의 PKCE 및 쿠키 세션을 사용하고 서버에서 getUser로 인증 상태를 확인합니다.

기존 GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET은 현재 앱에서 사용하지 않습니다. Google 비밀값은 Supabase Provider 설정에 보관하세요. Google 인증을 실제로 검증하려면 프로젝트 설정이 필요합니다.

## 개발 서버 실행

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

http://127.0.0.1:3000 에 접속합니다. `npm test`로 예약 충돌·동시 신청·분기 반복·취소 권한을 검사하고, `npm run build`로 프로덕션 빌드를 확인합니다.

## 기능

- 신청 내역의 예약 수정 버튼으로 기존 입력을 변경합니다. 신청자의 관리 토큰 또는 담당자 권한을 서버에서 검사합니다.
- 변경 일정에 충돌이 있으면 전체 수정이 실패하고 원래 예약을 유지합니다. 예약 ID와 관리 토큰을 유지합니다.
- 담당자는 정기 예약을 한 날짜만 또는 선택 날짜 및 이후 반복 일정 전체로 수정할 수 있습니다. 전체 수정은 취소된 날짜를 제외하고 차량·시간·신청 정보를 함께 변경합니다. 날짜를 변경하면 이후 날짜도 같은 일수만큼 이동합니다.
- 담당자가 변경한 예약도 기존 신청자의 신청 내역에 최신 내용으로 반영됩니다.

- 차량별 일간 타임라인과 예약 가능한 시간. 운영 시간 07:00~22:00.
- 이름, 부서, 연락처, 목적지, 목적, 인원, 이용 시간, 요청 사항을 포함한 신청 폼.
- 서버에서 차량·날짜·시간 충돌 및 탑승 인원 검사. 끝나는 시간과 다음 시작 시간이 같으면 예약 가능.
- 신청 즉시 확정, 이 브라우저의 내역 조회 및 취소. 조회용 일반 API에는 개인정보를 제공하지 않습니다.
- 담당자 비밀번호로 분기(1~4분기)와 요일을 선택해 정기 운행 등록. 분기 전체에 반복하며 기존 예약 충돌 시 한 건도 저장하지 않습니다.
- 담당자의 전체 신청 조회 및 개별 취소. 정기 예약도 개별 운행 단위로 취소합니다.

## 개발용 저장과 확장

서버 파일 `data/bookings.json`에 저장하며 재시작 후에도 유지됩니다. 한 Node 프로세스 내부의 저장 큐와 임시 파일 교체로 동시 신청을 직렬화합니다. `lib/store.mjs`가 저장 어댑터이고 `lib/domain.mjs`가 검증 및 충돌 규칙입니다. 차량은 스타리아(5524), 25인승 버스, 45인승 버스, 본니발(9인승)이며 domain 파일에서 수정할 수 있습니다.

내 신청의 관리 토큰은 브라우저 localStorage에 보관됩니다. 다른 브라우저로 옮기거나 브라우저 데이터를 지우면 개인 내역 접근이 사라집니다. 담당자는 모든 내역을 조회할 수 있습니다. 개발 비밀번호는 `school-admin-local`이며 `.env.local`의 `ADMIN_TOKEN`으로 변경하세요. 실제 배포에서는 학교 로그인, 사용자 권한, HTTPS, 관리 토큰 저장 개선이 필요합니다.

Supabase 전환 시 store 어댑터를 교체하고 DB 트랜잭션/기간 겹침 제약으로 여러 서버의 중복을 방지해야 합니다. `.env.example`에 Supabase·Cloudflare 예시가 있습니다. GitHub용 소스와 .gitignore가 준비되어 있지만 원격 연결이나 배포는 수행하지 않았습니다. Cloudflare에서는 Node 파일 저장 대신 DB 기반 어댑터로 바꾼 후 Next.js 지원 배포 구성을 적용하세요. 비밀키는 서버 환경에만 보관해야 합니다.

## Google Form 참고

제공된 Google Form 링크는 조회 도구에서 접근되지 않았으나 사용자가 제공한 설문 스크린샷을 반영했습니다. 차량, 사용일, 이름, 목적지, 사용목적, 사용시간, 반납시간, 기타 문항을 포함합니다. 소속과 연락처는 선택 입력입니다. 분기는 1~3월, 4~6월, 7~9월, 10~12월의 달력 분기입니다. 미래 날짜를 포함해 분기 전체의 선택 요일을 등록하며, 과거 날짜도 포함될 수 있습니다.

