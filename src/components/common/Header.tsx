'use client';

import { Container, Group, Text, Button, rem } from '@mantine/core';
import { ShoppingCart, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ height: rem(60), borderBottom: '1px solid #373A40', backgroundColor: '#1A1B1E', position: 'sticky', top: 0, zIndex: 100 }}>
      <Container size="lg" h="100%">
        <Group justify="space-between" h="100%">
          <Text
            size="xl"
            fw={900}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            component={Link}
            href="/"
            style={{ textDecoration: 'none' }}
          >
            IUH RESTO
          </Text>

          <Group>
            <Button variant="subtle" leftSection={<ShoppingCart size={18} />} color="blue">
              Giỏ hàng
            </Button>
            <Button variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} leftSection={<LogIn size={18} />} component={Link} href="/login">
              Đăng nhập
            </Button>
          </Group>
        </Group>
      </Container>
    </header>
  );
}
