const BLOG_URL = "https://blog.naver.com/dic17";

const headers = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  "Content-Type": "text/html; charset=utf-8",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

function renderPage(message = "") {
  const alert = message ? `<p class="error" role="alert">${message}</p>` : "";
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#153f78">
  <title>네이버 블로그 접속 | Chris의 홈페이지</title>
  <style>
    * { box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: grid;
      place-items: center;
      margin: 0;
      padding: 24px;
      color: #f7f8fc;
      background: radial-gradient(ellipse at 80% 10%, rgba(255, 215, 143, .18), transparent 34rem), #153f78;
      font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(100%, 440px);
      padding: 36px;
      border: 1px solid rgba(255, 255, 255, .16);
      border-radius: 22px;
      background: rgba(25, 34, 58, .92);
      box-shadow: 0 24px 70px rgba(0, 0, 0, .24);
    }
    a { color: #ffe27a; font-size: 13px; font-weight: 800; text-decoration: none; }
    h1 { margin: 28px 0 10px; font-size: clamp(26px, 6vw, 34px); letter-spacing: -.04em; }
    p { color: #e7c2ae; font-size: 14px; line-height: 1.7; }
    label { display: block; margin: 24px 0 8px; font-size: 13px; font-weight: 700; }
    input {
      width: 100%;
      min-height: 48px;
      padding: 0 13px;
      border: 1px solid rgba(255, 255, 255, .2);
      border-radius: 10px;
      color: #f7f8fc;
      background: rgba(255, 255, 255, .06);
      font: inherit;
    }
    input:focus-visible, button:focus-visible, a:focus-visible { outline: 3px solid #ffe27a; outline-offset: 3px; }
    button {
      width: 100%;
      min-height: 48px;
      margin-top: 14px;
      border: 0;
      border-radius: 10px;
      color: #20243a;
      background: linear-gradient(135deg, #ffe990, #ffc94d);
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }
    .error { color: #ffb4a9; }
    @media (max-width: 480px) { main { padding: 28px 22px; } }
  </style>
</head>
<body>
  <main>
    <a href="/">CHRIS · 홈으로</a>
    <h1>네이버 블로그 접속</h1>
    <p>블로그를 방문하려면 비밀번호를 입력해 주세요.</p>
    ${alert}
    <form method="post" action="/blog-access">
      <label for="password">비밀번호</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
      <button type="submit">블로그로 이동</button>
    </form>
  </main>
</body>
</html>`;
}

function htmlResponse(message, status = 200) {
  return new Response(renderPage(message), { status, headers });
}

export async function onRequestGet() {
  return htmlResponse();
}

export async function onRequestPost({ request, env }) {
  if (typeof env.BLOG_PASSWORD !== "string" || env.BLOG_PASSWORD.length === 0) {
    return htmlResponse("블로그 비밀번호 설정이 완료되지 않았습니다. 사이트 관리자에게 문의해 주세요.", 503);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return new Response("Unsupported Media Type", { status: 415, headers });
  }

  const body = await request.text();
  if (body.length > 2048) {
    return new Response("Request Too Large", { status: 413, headers });
  }

  const submittedPassword = new URLSearchParams(body).get("password");
  if (submittedPassword !== env.BLOG_PASSWORD) {
    return htmlResponse("비밀번호가 올바르지 않습니다. 다시 입력해 주세요.", 401);
  }

  return new Response(null, {
    status: 303,
    headers: {
      ...headers,
      Location: BLOG_URL,
    },
  });
}
