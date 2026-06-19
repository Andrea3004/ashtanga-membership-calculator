import { ConversionHistoryItem } from "./conversionHistory";
import { formatWon } from "./utils";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function safeFilePart(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]/g, "_") || "회원";
}

export async function downloadConversionPdf(item: ConversionHistoryItem) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const issuedAt = new Date().toLocaleString("ko-KR");
  const rows = [
    ["회원 이름", item.name || "-"],
    ["회원권 기간", item.periodType],
    ["일반회원 시작일", item.startDate || "-"],
    ["일반회원 만료일", item.endDate || "-"],
    ["전환일", item.convertDate || "-"],
    ["일반회원 실결제액", formatWon(item.paid)],
    ["마이솔 동일 조건 기준가", formatWon(item.mysolPrice)],
    ["전체 등록일수", `${item.totalDays}일`],
    ["일반회원 잔여일수", `${item.remainingDays}일`],
    ["일반회원 잔여금액", formatWon(item.remainingAmount)],
    ["마이솔 동일 조건 1일 단가", formatWon(item.mysolPerDay)],
    ["전환 후 마이솔 인정일수", `${item.recognizedDays}일`],
    ["새 마이솔 만료일", item.newExpiry || "-"],
    ["저장일시", item.savedAt || "-"],
  ];

  const documentElement = document.createElement("div");
  documentElement.setAttribute("aria-hidden", "true");
  documentElement.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:794px",
    "padding:42px 46px 32px",
    "box-sizing:border-box",
    "background:#ffffff",
    "color:#17292c",
    'font-family:"Pretendard","Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",Arial,sans-serif',
  ].join(";");

  documentElement.innerHTML = `
    <div style="color:#39766f;font-size:12px;font-weight:800;letter-spacing:3px;">ASHTANGA YOGA STUDIO</div>
    <div style="margin-top:8px;font-size:28px;font-weight:800;letter-spacing:-0.8px;">회원 전환 계산서</div>
    <div style="margin-top:18px;padding:15px 17px;border:1px solid #cfe4e0;border-radius:8px;background:#f3faf8;color:#405a5d;font-size:11px;line-height:1.65;word-break:keep-all;overflow-wrap:anywhere;">
      본 전환 계산서는 일반회원의 잔여가치를 마이솔 동일 조건 1일 단가로 환산하여 인정일수와 새 만료일을 산정한 참고용 계산서입니다.
    </div>
    <table style="width:100%;margin-top:18px;border-collapse:collapse;table-layout:fixed;font-size:11px;">
      <tbody>
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <th style="width:39%;padding:8px 12px;border-bottom:1px solid #e4ecea;background:#f7faf9;color:#496266;text-align:left;font-weight:700;word-break:keep-all;">
                  ${escapeHtml(label)}
                </th>
                <td style="padding:8px 12px;border-bottom:1px solid #e4ecea;color:#17292c;text-align:left;font-weight:600;word-break:break-word;">
                  ${escapeHtml(value)}
                </td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
    <div style="margin-top:18px;padding:18px 20px;border:2px solid #7fb9b4;border-radius:10px;background:#eff8f6;text-align:center;">
      <div style="color:#426d69;font-size:12px;font-weight:700;">새 마이솔 만료일</div>
      <div style="margin-top:6px;color:#102f35;font-size:30px;font-weight:900;letter-spacing:-1px;">${escapeHtml(item.newExpiry || "-")}</div>
      <div style="margin-top:5px;color:#55716f;font-size:11px;font-weight:600;">마이솔 인정일수 ${item.recognizedDays}일</div>
    </div>
    <div style="display:flex;justify-content:space-between;gap:16px;margin-top:20px;padding-top:10px;border-top:1px solid #e4ecea;color:#718285;font-size:9px;">
      <span>발행일시: ${escapeHtml(issuedAt)}</span>
      <span style="font-weight:700;letter-spacing:0.6px;">ASHTANGA YOGA STUDIO</span>
    </div>
  `;

  document.body.appendChild(documentElement);

  try {
    await document.fonts?.ready;
    const canvas = await html2canvas(documentElement, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true,
    });
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    const imageRatio = canvas.width / canvas.height;
    let imageWidth = availableWidth;
    let imageHeight = imageWidth / imageRatio;

    if (imageHeight > availableHeight) {
      imageHeight = availableHeight;
      imageWidth = imageHeight * imageRatio;
    }

    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.96),
      "JPEG",
      (pageWidth - imageWidth) / 2,
      (pageHeight - imageHeight) / 2,
      imageWidth,
      imageHeight,
    );
    pdf.save(
      `회원전환계산서_${safeFilePart(item.name)}_${safeFilePart(item.convertDate || "날짜없음")}.pdf`,
    );
  } finally {
    documentElement.remove();
  }
}
