import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AppTheme from '../../../theme/muitheme/AppTheme';
import { GoogleIcon, KakaoIcon, NaverIcon, PinkTruckIcon } from '../common/IconComponent';
import useCustomMove from '../../../hooks/useCustomMove';
import { login } from '../../../api/loginApi';
import { UserCard as Card, UserContainer as SignInContainer } from '../../../theme/User/UserCard';
import { useState } from 'react';
import ForgotPasswordModal from '../modal/ForgotPasswordModal';
import { useAuth } from '../../../auth/AuthProvider';


export default function LoginComponent(props) {
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [password, setPassword] = useState("");
    const [id, setId] = useState("");
    const [forgotOpen, setForgotOpen] = useState(false);

    const { refreshAuth } = useAuth();

    const {
        moveToSignUpPage,
        moveToNewPassword,
        moveToMyPageByRole,
        oauthLogin
    } = useCustomMove();

    // 유효성 검사
    const validateInputs = () => {
        let isValid = true;

        // 이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!id || !emailRegex.test(id)) {
            setEmailError(true);
            setEmailErrorMessage('이메일 형식에 맞게 입력해주세요');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        // 비밀번호 유효성 검사 (영문, 숫자, 특수문자 포함 8자 이상)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            setPasswordError(true);
            setPasswordErrorMessage('비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInputs()) return;

        try {
            const res = await login({ id, passwordEnc: password });

            const role = res?.role;
            if (role) {
                moveToMyPageByRole(role);
            } else {
                console.warn("login 응답에 role이 없어 라우팅을 건너뜁니다");
            }

            await refreshAuth(true);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                alert("ID 또는 비밀번호가 틀렸습니다");
            } else {
                alert(err?.message || "로그인 중 오류가 발생했습니다");
            }
        }
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <SignInContainer direction="column" justifyContent="space-between">
                <Card variant="outlined">
                    <PinkTruckIcon />
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                    >
                        로그인
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            gap: 2,
                        }}
                    >
                        <FormControl>
                            <FormLabel htmlFor="id">ID</FormLabel>
                            <TextField
                                error={emailError}
                                helperText={emailErrorMessage}
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                id="id"
                                type="email"
                                name="id"
                                placeholder="your@email.com"
                                autoComplete="email"
                                required
                                fullWidth
                                variant="outlined"
                                color={emailError ? 'error' : 'primary'}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="password">비밀번호</FormLabel>
                            <TextField
                                error={passwordError}
                                helperText={passwordErrorMessage}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                name="password"
                                placeholder="••••••"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                required
                                fullWidth
                                variant="outlined"
                                color={passwordError ? 'error' : 'primary'}
                            />
                        </FormControl>

                        <ForgotPasswordModal
                            open={forgotOpen}
                            handleClose={() => setForgotOpen(false)}
                            onVerified={({ token }) => moveToNewPassword(token, { replace: true })}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 4 }}
                        >
                            로그인
                        </Button>
                        <Link
                            component="button"
                            type="button"
                            onClick={() => setForgotOpen(true)}
                            variant="body2" sx={{ alignSelf: 'center' }}>
                            비밀번호 찾기
                        </Link>
                    </Box>
                    <Divider sx={{ mt: 2 }}>
                        <Typography sx={{ color: 'text.secondary' }}>SNS 로그인</Typography>
                    </Divider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => oauthLogin("google")}
                            startIcon={<GoogleIcon />}
                        >
                            구글 로그인
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => oauthLogin("naver")}
                            startIcon={<NaverIcon />}
                        >
                            네이버 로그인
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => oauthLogin("kakao")}
                            startIcon={<KakaoIcon />}
                        >
                            카카오 로그인
                        </Button>
                        <Typography sx={{ textAlign: 'center' }}>
                            회원이 아니신가요?{' '}
                            <Link
                                component="button"
                                variant="body2"
                                sx={{
                                    alignSelf: 'center',
                                    verticalAlign: 'baseline',
                                    padding: 0,
                                    lineHeight: 'inherit'
                                }}
                                onClick={moveToSignUpPage}
                            >
                                회원가입
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </SignInContainer>
        </AppTheme>
    );
}