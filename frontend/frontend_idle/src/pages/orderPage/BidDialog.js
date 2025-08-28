// BidDialog.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

/**
 * Props
 * - open: boolean
 * - onClose: () => void
 * - onSubmit: ({ price, memo, vehicleName, ton, cargoType }) => Promise|void
 * - minBid: number (원)
 * - defaultVehicle?: string
 * - defaultTon?: '0.5t'|'1t'|'2.5t'|'5t'|'10t'
 * - defaultCargoType?: string
 */
const VEHICLES = ["오토바이", "다마스", "라보", "카고/윙", "카고", "윙바디", "탑", "냉동", "냉장"];
const TONS = ["0.5t", "1t", "2.5t", "5t", "10t"];
const CARGO_TYPES = [
  { key: "box", ko: "박스", en: "box" },
  { key: "pallet", ko: "파렛트", en: "pallet" },
  { key: "appliance", ko: "가전제품", en: "appliance" },
  { key: "furniture", ko: "가구", en: "furniture" },
  { key: "food", ko: "식품", en: "food" },
  { key: "clothing", ko: "의류", en: "clothing" },
  { key: "machine", ko: "기계·부품", en: "machine" },
  { key: "etc", ko: "기타", en: "etc" },
];

const BidDialog = ({
  open,
  onClose,
  onSubmit,
  minBid = 0,
  defaultVehicle,
  defaultTon = "1t",
  defaultCargoType = "box",
}) => {
  const [price, setPrice] = useState("");
  const [memo, setMemo] = useState("");
  const [vehicle, setVehicle] = useState(defaultVehicle || VEHICLES[0]);
  const [ton, setTon] = useState(defaultTon);
  const [cargoType, setCargoType] = useState(defaultCargoType);

  const priceInputRef = useRef(null);

  // 포털 타겟
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  // 열렸을 때: 바디 스크롤 잠금 + ESC 닫기 + 포커스
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);

    // 입력창 포커스
    setTimeout(() => priceInputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const isPriceValid = useMemo(() => {
    const num = Number(price);
    return Number.isFinite(num) && num >= Math.max(0, minBid);
  }, [price, minBid]);

  const handleSubmit = async () => {
    if (!isPriceValid) {
      alert(`제안가는 최소 ${minBid.toLocaleString()}원 이상이어야 합니다.`);
      return;
    }
    await onSubmit?.({
      price: Number(price),
      memo,
      vehicleName: vehicle,
      ton,
      cargoType,
    });
  };

  if (!open || !portalTarget) return null;

  // ===== 포털로 최상단에 렌더 =====
  return createPortal(
    <Overlay onMouseDown={onClose}>
      <Dialog role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <Topbar>
          <Title>입찰 등록</Title>
          <TopActions>
            <MinInfo>최소 {minBid.toLocaleString()}원</MinInfo>
            <BtnGhost onClick={onClose}>닫기</BtnGhost>
            <BtnPrimary onClick={handleSubmit} disabled={!isPriceValid}>
              등록
            </BtnPrimary>
          </TopActions>
        </Topbar>

        <ContentArea>
          <TwoCol>
            <Col>
              <Section>
                <SectionTitle>화물 종류</SectionTitle>
                <CardGrid>
                  {CARGO_TYPES.map((c) => (
                    <Card
                      key={c.key}
                      data-active={cargoType === c.key}
                      onClick={() => setCargoType(c.key)}
                    >
                      <CardKo>{c.ko}</CardKo>
                      <CardEn>{c.en}</CardEn>
                    </Card>
                  ))}
                </CardGrid>
              </Section>

              <Section>
                <SectionTitle>차량 종류</SectionTitle>
                <ChipRail>
                  {VEHICLES.map((v) => (
                    <Chip key={v} data-active={vehicle === v} onClick={() => setVehicle(v)}>
                      {v}
                    </Chip>
                  ))}
                </ChipRail>
              </Section>

              <Section>
                <SectionTitle>톤수</SectionTitle>
                <ChipRow>
                  {TONS.map((t) => (
                    <Chip key={t} data-active={ton === t} onClick={() => setTon(t)}>
                      {t}
                    </Chip>
                  ))}
                </ChipRow>
              </Section>
            </Col>

            <Col>
              <Section>
                <SectionTitle>제안가 (원)</SectionTitle>
                <Input
                  ref={priceInputRef}
                  type="number"
                  min={minBid}
                  placeholder={`최소 ${minBid.toLocaleString()}원`}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <Hint>숫자만 입력 (원 단위)</Hint>
              </Section>

              <Section>
                <SectionTitle>메모 (선택)</SectionTitle>
                <Textarea
                  rows={8}
                  placeholder="화물/동선/상하차 조건 등 간단히 남겨주세요."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </Section>
            </Col>
          </TwoCol>
        </ContentArea>
      </Dialog>
    </Overlay>,
    portalTarget
  );
};

export default BidDialog;

/* ================= 스타일 ================ */

const PINK = {
  border: "#ead9e3",
  active: "#e85aa6",
  tagBg: "#ffe2ef",
  tagText: "#d84b95",
  text: "#2b2330",
  sub: "#8c7f88",
  bg: "#ffffff",
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2147483647;         /* 최상위로 강제 */
  background: rgba(0, 0, 0, 0.38); /* 어둡게 */
  display: grid;
  place-items: center;
  padding: 24px;               /* 좁은 화면 여백 */
`;

const Dialog = styled.div`
  width: min(1100px, 96vw);
  height: min(92vh, 960px);
  background: ${PINK.bg};
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;            /* 내부 스크롤만 */
`;

const Topbar = styled.div`
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${PINK.border};
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: ${PINK.text};
`;

const TopActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const MinInfo = styled.div`
  font-size: 12px;
  color: ${PINK.sub};
  margin-right: 6px;
`;

const BtnGhost = styled.button`
  border: 1px solid ${PINK.border};
  background: #fff;
  color: ${PINK.text};
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
`;

const BtnPrimary = styled.button`
  border: 0;
  background: ${PINK.tagBg};
  color: ${PINK.tagText};
  padding: 9px 14px;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const ContentArea = styled.div`
  flex: 1 1 auto;
  overflow: auto;
  padding: 16px;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div``;

const Section = styled.section`
  border: 1px solid ${PINK.border};
  border-radius: 10px;
  background: #fff;
  padding: 12px;
  margin-bottom: 16px;
`;

const SectionTitle = styled.div`
  font-weight: 900;
  color: ${PINK.text};
  margin-bottom: 10px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 460px) { grid-template-columns: 1fr; }
`;

const Card = styled.button`
  border: 1px solid ${PINK.border};
  background: #fff;
  text-align: left;
  padding: 12px 12px 10px;
  border-radius: 10px;
  cursor: pointer;
  &[data-active="true"] {
    border-color: ${PINK.active};
    background: #fff7fb;
  }
`;

const CardKo = styled.div`
  font-weight: 900;
  color: ${PINK.text};
`;
const CardEn = styled.div`
  font-size: 12px;
  color: ${PINK.sub};
  margin-top: 2px;
`;

const ChipRail = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
`;
const ChipRow = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap;
`;

const Chip = styled.button`
  border: 1px solid ${PINK.border};
  background: #fff;
  color: ${PINK.text};
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  &[data-active="true"] {
    border-color: ${PINK.tagText};
    background: ${PINK.tagBg};
    color: ${PINK.tagText};
  }
`;

const Input = styled.input`
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid ${PINK.border};
  outline: none;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${PINK.border};
  outline: none;
  resize: vertical;
`;

const Hint = styled.div`
  margin-top: 6px;
  font-size: 12px;
  color: ${PINK.sub};
`;
