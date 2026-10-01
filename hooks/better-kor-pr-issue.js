// UserPromptSubmit: 사용자가 PR·이슈를 "쓰라"고 할 때만 better-kor 의 해당 모드 규칙을 미리 붙인다.
// 본문을 쓰기 전에 들어가야 효과가 있으므로 gh 명령 앞이 아니라 여기서 건다.
// 읽기·확인·닫기처럼 쓰는 일이 아닌 말에는 걸지 않는다.
const fs = require("fs");

let prompt = "";
try {
  prompt = JSON.parse(fs.readFileSync(0, "utf8")).prompt || "";
} catch (e) {
  process.exit(0);
}

const wantsPr =
  /(\bPR\b|풀리퀘|pull\s*request|머지\s*요청)[^.!?\n]{0,12}(써|쓰|작성|올려|올리|만들|등록|생성|초안)/i.test(prompt) ||
  /(써|쓰|작성|올려|올리|만들|등록|생성|초안)[^.!?\n]{0,12}(\bPR\b|풀리퀘|pull\s*request)/i.test(prompt) ||
  /gh\s+pr\s+create/i.test(prompt);

const wantsIssue =
  /(이슈|\bissue\b)[^.!?\n]{0,12}(써|쓰|작성|올려|올리|만들|등록|생성|초안)/i.test(prompt) ||
  /(써|쓰|작성|올려|올리|만들|등록|생성|초안)[^.!?\n]{0,12}(이슈|\bissue\b)/i.test(prompt) ||
  /버그\s*신고|기능\s*제안|gh\s+issue\s+create/i.test(prompt);

const PR = [
  "PR 본문을 쓸 때:",
  "읽는 사람은 리뷰어다.",
  "고정 체크리스트를 채우지 말고 커밋 기록과 diff 에서 해당되는 것만 뽑아 쓴다.",
  "해당 없는 항목은 비우지 말고 아예 쓰지 않는다.",
  "빌드가 통과합니다 같은 자기 신고는 CI 가 보여주므로 쓰지 않는다. 기계가 못 보는 것만 쓴다.",
  "「리뷰할 때 봐 주세요」(했는데 불안한 곳)와 「확인하지 못한 범위」(아예 안 본 곳)를 가른다.",
  "제목은 gh pr list 로 그 저장소의 기존 형식을 먼저 보고 따른다."
].join(" ");

const ISSUE = [
  "이슈를 쓸 때:",
  "판정문이 아니라 관찰한 증상 한 줄로 시작한다. 원인을 짐작했으면 짐작이라고 밝힌다.",
  "제목은 gh issue list 로 기존 형식을 먼저 보고 따른다. 증상을 쓰고 추측한 원인은 제목에 넣지 않는다.",
  "버그면 재현 절차·기대한 동작과 실제 동작·환경·어디까지 봤나를 적는다.",
  "제안이면 해결책보다 지금 무엇이 불편한지부터 적는다.",
  "재현 절차와 환경을 뺀 설명은 다섯 줄 안으로."
].join(" ");

const parts = [];
if (wantsPr) parts.push(PR);
if (wantsIssue) parts.push(ISSUE);
if (parts.length === 0) process.exit(0);

parts.push("자세한 규칙은 better-kor 스킬의 해당 절에 있다.");

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: parts.join(" ")
  },
  suppressOutput: true
}));
