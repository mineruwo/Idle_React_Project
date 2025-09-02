import { Box, Container, Paper, Typography } from "@mui/material";
import { Handshake, Gavel, Tune, Reviews, LocalShipping } from "@mui/icons-material";
import "../../../theme/main/FeatureStrip.css";

const FEATURES = [
    { title: "화주 차주 매칭", desc: "화주·차주 연결", icon: <Handshake /> },
    { title: "입찰 서비스", desc: "다중 견적 경쟁", icon: <Gavel /> },
    { title: "고객 맞춤 신청", desc: "차종·시간 커스터마이즈", icon: <Tune /> },
    { title: "따땃함 시스템", desc: "차주 운송 피드백", icon: <Reviews /> },
    { title: "운송 현황", desc: "실시간 진행 상황", icon: <LocalShipping /> },
];

export default function FeatureStrip() {
  return (
    <Container maxWidth="lg" className="feature-root">
      <Box className="feature-header">
        <Typography variant="h5" className="feature-title">
          IDLE의 다양한 서비스를 경험해보세요
        </Typography>
        <Typography variant="body2" color="text.secondary">
          등록부터 매칭·입찰·리뷰·현황까지 한 곳에서
        </Typography>
      </Box>

      <Box className="feature-grid">
        {FEATURES.map((f) => (
          <Paper
            key={f.title}
            elevation={0}
            className="feature-card"
            aria-label={f.title}
            role="article"
          >
            <Box className="feature-icon">{f.icon}</Box>
            <Typography fontWeight={700}>{f.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {f.desc}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}