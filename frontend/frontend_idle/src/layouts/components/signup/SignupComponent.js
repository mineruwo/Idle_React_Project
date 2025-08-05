import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../../../theme/muitheme/AppTheme';
import { GoogleIcon, KakaoIcon, PinkTruckIcon } from '../login/IconComponent';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  position: 'relative',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp(props) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [nicknameError, setNicknameError] = React.useState(false);
  const [nicknameErrorMessage, setNicknameErrorMessage] = React.useState('');
  const [phoneError, setPhoneError] = React.useState(false);
  const [phoneErrorMessage, setPhoneErrorMessage] = React.useState('');
  const [userType, setUserType] = React.useState('shipper');


  const validateInputs = () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const name = document.getElementById('name').value.trim();
    const nickname = document.getElementById('nickname').value.trim();
    const phone = document.getElementById('phone').value.trim();

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

    // 이름 유효성 검사 (한글/영문 2자 이상)
    const nameRegex = /^[가-힣a-zA-Z]{2,20}$/;
    if (!name || !nameRegex.test(name)) {
      setNameError(true);
      setNameErrorMessage('이름은 한글 또는 영문 2자 이상으로 입력해주세요');
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    // 닉네임 유효성 검사
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;
    if (!nickname || !nicknameRegex.test(nickname)) {
      setNicknameError(true);
      setNicknameErrorMessage('닉네임은 한글, 영문, 숫자로 2자 이상 10자 이하로 입력해주세요');
      isValid = false;
    } else {
      setNicknameError(false);
      setNicknameErrorMessage('');
    }

    // 전화번호 유효성 검사 (하이픈 유무와 무관하게 허용)
    const phoneRegex = /^01[0-9]{1}-?\d{3,4}-?\d{4}$/;
    if (!phone || !phoneRegex.test(phone)) {
      setPhoneError(true);
      setPhoneErrorMessage('전화번호 형식에 맞게 입력해주세요 (예시: 010-1234-5678)');
      isValid = false;
    } else {
      setPhoneError(false);
      setPhoneErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = (event) => {
    if (nameError || emailError || passwordError) {
      event.preventDefault();
      return;
    }
    const data = new FormData(event.currentTarget);
    console.log({
      name: data.get('name'),
      lastName: data.get('lastName'),
      email: data.get('email'),
      password: data.get('password'),
      phone: data.get('phone'),
    });
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <PinkTruckIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            회원가입
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {/* 이름 */}
            <FormControl>
              <FormLabel htmlFor="name">이름</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                fullWidth
                id="name"
                placeholder="홍길동"
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? 'error' : 'primary'}
              />
            </FormControl>
            {/* 이메일 */}
            <FormControl>
              <FormLabel htmlFor="email">이메일</FormLabel>
              <TextField
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            {/* 비밀번호 */}
            <FormControl>
              <FormLabel htmlFor="password">비밀번호</FormLabel>
              <TextField
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            {/* 닉네임 */}
            <FormControl>
              <FormLabel htmlFor="nickname">닉네임</FormLabel>
              <TextField
                fullWidth
                name="nickname"
                placeholder="idle"
                type="nickname"
                id="nickname"
                autoComplete="nickname"
                variant="outlined"
                error={nicknameError}
                helperText={nicknameErrorMessage}
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            {/* 전화번호 */}
            <FormControl>
              <FormLabel htmlFor="phone">전화번호</FormLabel>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                placeholder="010-1234-5678"
                autoComplete="tel"
                variant="outlined"
                error={phoneError}
                helperText={phoneErrorMessage}
                color={phoneError ? 'error' : 'primary'}
              />
            </FormControl>
            {/* 회원 유형 */}
            <FormControl component="fieldset">
              <FormLabel component="legend"
                sx={{
                  color: 'grey.800',
                  '&.Mui-focused': {
                    color: 'grey.800', // 포커스 되어도 색 유지
                  }
                }}>
                회원 유형
              </FormLabel>
              <RadioGroup
                row
                name="userType"
                defaultValue="shipper"
                onChange={(e) => setUserType(e.target.value)}
              >
                <FormControlLabel value="shipper" control={<Radio />} label="화주" />
                <FormControlLabel value="carrier" control={<Radio />} label="차주" />
              </RadioGroup>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              회원가입
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: 'text.secondary' }}>SNS 회원가입</Typography>
          </Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign up with Google')}
              startIcon={<GoogleIcon />}
            >
              구글 가입
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert('Sign up with Kakao')}
              startIcon={<KakaoIcon />}
            >
              카카오 가입
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              이미 계정이 있나요?{' '}
              <Link
                href="/material-ui/getting-started/templates/sign-in/"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                로그인
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}