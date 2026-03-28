'use client';

import React, { useState } from 'react';
import {
  TextInput, PasswordInput, Button, Title, Text, Container, Paper, Box, Transition
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/store/authStore';
import https from '@/api/https';
import { Coffee } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@iuh.edu.vn');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuth((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await https.post('/auth/login', { email, password });
      setAuth(data.token, data.user);
      notifications.show({
        title: 'Thành công',
        message: 'Đăng nhập trang Quản trị viên thành công.',
        color: 'orange'
      });
      router.push('/');
    } catch (error: any) {
      notifications.show({
        title: 'Từ chối truy cập',
        message: error.response?.data?.message || 'Thông tin đăng nhập không hợp lệ',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fff7ed] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-400/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <Container size={420} w="100%" className="relative z-10">
        <Transition mounted={true} transition="slide-up" duration={600} timingFunction="ease-out">
          {(styles) => (
            <div style={styles}>
              <Box className="mb-10 text-center flex flex-col items-center">
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-5 rounded-3xl mb-5 shadow-sm border border-orange-200 transition-transform hover:scale-110 duration-500 group">
                  <Coffee size={44} className="text-orange-600 group-hover:animate-bounce" />
                </div>
                <Title order={1} className="text-orange-950 text-4xl font-black mb-2 tracking-wide uppercase drop-shadow-sm">
                  Orange Cafe
                </Title>
                <Text size="sm" className="text-orange-600 font-bold tracking-[0.2em] uppercase opacity-90">
                  Hệ thống Quản trị
                </Text>
              </Box>

              <form onSubmit={handleLogin} className="relative">
                <div className="absolute inset-0 bg-white/40 blur-2xl rounded-3xl -z-10"></div>
                <Paper
                  withBorder
                  p={40}
                  radius="xl"
                  className="bg-white/80 backdrop-blur-xl shadow-2xl border-orange-100/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-300 via-orange-500 to-orange-300"></div>

                  <TextInput
                    label="Tài khoản quản trị"
                    placeholder="admin@orange.cafe"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                    styles={{
                      input: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#fed7aa', color: '#431407', borderRadius: '0.5rem', transition: 'all 0.3s ease', '&:focus': { borderColor: '#f97316' } },
                      label: { color: '#9a3412', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }
                    }}
                  />

                  <PasswordInput
                    label="Mật khẩu đăng nhập"
                    placeholder="••••••••"
                    required
                    mt="xl"
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    styles={{
                      input: { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#fed7aa', color: '#431407', borderRadius: '0.5rem', transition: 'all 0.3s ease' },
                      innerInput: { color: '#431407' },
                      label: { color: '#9a3412', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    loading={loading}
                    mt={32}
                    size="lg"
                    radius="md"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold transition-all shadow-xl hover:shadow-orange-500/40 active:scale-[0.98] border-0"
                  >
                    Truy cập hệ thống
                  </Button>
                </Paper>
              </form>
            </div>
          )}
        </Transition>
      </Container>
    </div>
  );
}

