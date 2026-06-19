import { RefundHistoryItem } from "./refundHistory";
import { formatWon, formatWonFloor } from "./utils";

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

export async function downloadRefundPdf(item: RefundHistoryItem) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const issuedAt = new Date().toLocaleString("ko-KR");
  const rows = [
    ["회원 이름", item.name || "-"],
    ["회원권 기간 유형", item.periodType],
    ["수련 시작일", item.startDate || "-"],
    ["수련 만료일", item.endDate || "-"],
    ["환불 요청일", item.requestDate || "-"],
    ["정상가", formatWon(item.fullPrice)],
    ["실결제액", formatWon(item.paid)],
    ["전체 등록일수", `${item.totalDays}일`],
    ["이용일수", `${item.usedDays}일`],
    ["잔여일수", `${item.remainingDays}일`],
    ["정상가 기준 1일 단가", formatWon(item.perDay)],
    ["정상가 기준 이용금액", formatWon(item.usedAmount)],
    ["위약금", formatWon(item.penalty)],
    ["카드수수료", formatWon(item.cardFee)],
    ["저장일시", item.savedAt || "-"],
  ];

  const documentElement = document.createElement("div");
  documentElement.setAttribute("aria-hidden", "true");
  documentElement.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "width:794px",
    "padding:38px 44px 30px",
    "box-sizing:border-box",
    "background:#ffffff",
    "color:#242124",
    'font-family:"Pretendard","Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",Arial,sans-serif',
  ].join(";");

  documentElement.innerHTML = `
    <div style="color:#9f5968;font-size:12px;font-weight:800;letter-spacing:3px;">
      ASHTANGA YOGA STUDIO
    </div>
    <div style="margin-top:8px;font-size:28px;font-weight:800;letter-spacing:-0.8px;">
      환불 계산서
    </div>
    <div style="margin-top:17px;padding:14px 16px;border:1px solid #eadde0;border-radius:8px;background:#fff9fa;color:#574f51;font-size:11px;line-height:1.55;word-break:keep-all;overflow-wrap:anywhere;">
      <p style="margin:0 0 6px;">본 환불 계산서는 공정거래위원회 소비자분쟁해결기준 및 ASHTANGA YOGA STUDIO 환불 규정에 따라 산정된 참고용 계산서입니다.</p>
      <p style="margin:0 0 6px;">환불 금액은 회원권 계약 내용, 이용 내역 및 환불 규정에 따라 산정되었으며, 최종 환불 금액은 확인 절차를 거쳐 확정될 수 있습니다.</p>
      <p style="margin:0;">본 문서는 회원권 기간, 이용 내역, 환불 산정 기준을 함께 확인할 수 있도록 작성되었습니다.</p>
    </div>
    <table style="width:100%;margin-top:16px;border-collapse:collapse;table-layout:fixed;font-size:11px;">
      <tbody>
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <th style="width:37%;padding:7px 12px;border-bottom:1px solid #eee7e9;background:#fcfafb;color:#675d60;text-align:left;font-weight:700;word-break:keep-all;">
                  ${escapeHtml(label)}
                </th>
                <td style="padding:7px 12px;border-bottom:1px solid #eee7e9;color:#292124;text-align:left;font-weight:600;word-break:break-word;">
                  ${escapeHtml(value)}
                </td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
    <div style="margin-top:17px;padding:17px 20px;border:2px solid #d994a5;border-radius:10px;background:#fff6f8;text-align:center;">
      <div style="color:#76545d;font-size:12px;font-weight:700;">최종 환불 예상금액</div>
      <div style="margin-top:6px;color:#2c2023;font-size:30px;font-weight:900;letter-spacing:-1px;">
        ${formatWonFloor(item.refund)}
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;gap:16px;margin-top:18px;padding-top:10px;border-top:1px solid #eee7e9;color:#8a8082;font-size:9px;">
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

    const x = (pageWidth - imageWidth) / 2;
    const y = (pageHeight - imageHeight) / 2;
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", x, y, imageWidth, imageHeight);

    const fileName = `환불계산서_${safeFilePart(item.name)}_${safeFilePart(item.requestDate || "날짜없음")}.pdf`;
    pdf.save(fileName);
  } finally {
    documentElement.remove();
  }
}
