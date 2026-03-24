'use client';

import React, { useState } from 'react';
import { 
  TextInput, PasswordInput, Button, Title, Text, Container, Paper, Box, Transition 
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/store/authStore';
import https from '@/api/https';

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
        color: 'blue' 
      });
      router.push('/admin');
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50">
      <Container size={420} w="100%">
        <Transition mounted={true} transition="slide-up" duration={400} timingFunction="ease">
          {(styles) => (
            <div style={styles}>
              <Box className="mb-8 text-center">
                <Title order={1} className="text-blue-900 text-3xl font-black mb-2 tracking-tight">
                  IUH Control Panel
                </Title>
                <Text size="sm" className="text-blue-600 font-medium">
                  Hệ thống Quản lý Nhà hàng
                </Text>
              </Box>

              <Paper 
                withBorder 
                p={40} 
                radius="md" 
                className="bg-white shadow-xl border-blue-100"
              >
                <form onSubmit={handleLogin}>
                  <TextInput
                    label="Email quản trị viên"
                    placeholder="admin@iuh.edu.vn"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                    styles={{
                      input: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#1e3a8a' },
                      label: { color: '#1e3a8a', marginBottom: '8px', fontWeight: 600 }
                    }}
                  />
                  
                  <PasswordInput
                    label="Mật khẩu"
                    placeholder="Nhập mật khẩu"
                    required
                    mt="xl"
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    styles={{
                      input: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', color: '#1e3a8a' },
                      innerInput: { color: '#1e3a8a' },
                      label: { color: '#1e3a8a', marginBottom: '8px', fontWeight: 600 }
                    }}
                  />

                  <Button 
                    fullWidth 
                    type="submit" 
                    loading={loading} 
                    mt="xl" 
                    size="md"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md"
                  >
                    Đăng nhập hệ thống
                  </Button>
                </form>
              </Paper>
            </div>
          )}
        </Transition>
      </Container>
    </div>
  );
}
