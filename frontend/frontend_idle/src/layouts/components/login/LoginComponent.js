import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ForgotPasswordComponent from './ForgotPasswordComponent';
import AppTheme from '../../../theme/muitheme/AppTheme';
import { GoogleIcon, KakaoIcon, PinkTruckIcon } from './IconComponent';
import useCustomMove from '../../../hooks/useCustomMove';
import { checkAccount, login } from '../../../api/loginApi';
import { UserCard as Card, UserContainer as SignInContainer } from '../../../theme/User/UserCard';


export default function SignIn(props) {
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [password, setPassword] = React.useState("");
    const [id, setId] = React.useState("");
    const [role, setRole] = React.useState("");

    const {
        shipperMoveToDashBoard,
        carOwnerMoveToDashboard
    } = useCustomMove();

    // 유효성 검사
    const validateInputs = () => {
        const email = document.getElementById('id').value.trim();
        const password = document.getElementById('password').value.trim();

        let isValid = true;

        // 이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!email || !emailRegex.test(email)) {
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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // 로그인 API 호출
    const loginApi = async () => {
        try {
            const result = await login({
                passwordEnc: password,
                id
            });
            alert("로그인 성공");

            const customRole = result.role;
            setRole(customRole);

            alert(customRole);

            if (customRole === "shipper") {
                shipperMoveToDashBoard();
            } else if (customRole === "carrier") {
                carOwnerMoveToDashboard();
            } else {
                alert("알 수 없는 사용자입니다");
            }
        } catch (err) {
            alert(err.message);
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        // ID & 암호 체크
        const isValidAccount = await checkAccount(id, password); // ID
        if (isValidAccount === false) {
            alert("존재하지 않는 ID 입니다");
            return;
        }

        loginApi();
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
                                type="id"
                                name="id"
                                placeholder="your@email.com"
                                autoComplete="id"
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
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="자동 로그인"
                        />
                        <ForgotPasswordComponent open={open} handleClose={handleClose} />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            onClick={validateInputs}
                        >
                            로그인
                        </Button>
                        <Link
                            component="button"
                            type="button"
                            onClick={handleClickOpen}
                            variant="body2"
                            sx={{ alignSelf: 'center' }}
                        >
                            비밀번호 찾기
                        </Link>
                    </Box>
                    <Divider>
                        <Typography sx={{ color: 'text.secondary' }}>SNS 로그인</Typography>
                    </Divider>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => alert('Sign in with Google')}
                            startIcon={<GoogleIcon />}
                        >
                            구글 로그인
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => alert('Sign in with Kakao')}
                            startIcon={<KakaoIcon />}
                        >
                            카카오 로그인
                        </Button>
                        <Typography sx={{ textAlign: 'center' }}>
                            회원이 아니신가요?{' '}
                            <Link
                                href="/material-ui/getting-started/templates/sign-in/"
                                variant="body2"
                                sx={{ alignSelf: 'center' }}
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