'use client';

import {
  Container,
  SimpleGrid,
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  Tabs,
  Title,
  Loader,
  Center,
  Stack,
  NumberInput,
  rem
} from '@mantine/core';
import { useAppQuery } from '@/hooks/useAppQuery';
import { ShoppingCart, LayoutGrid } from 'lucide-react';
import { formatCurrency } from '@/utils/helper';
import { useState } from 'react';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Fetch data with custom query hooks we made earlier
  const { data: categories, isLoading: loadingCats } = useAppQuery('getCategories');
  const { data: products, isLoading: loadingProds } = useAppQuery('getProducts', {
    categoryId: activeCategory === 'all' ? undefined : (activeCategory || undefined)
  });

  if (loadingCats || loadingProds) return <Center h="80vh"><Loader /></Center>;

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="end">
          <div>
            <Title order={1} fw={900}>Thực đơn hôm nay</Title>
            <Text c="dimmed">Chọn những món ăn yêu thích nhất của bạn</Text>
          </div>
        </Group>

        <Tabs value={activeCategory} onChange={setActiveCategory} variant="pills" radius="xl">
          <Tabs.List>
            <Tabs.Tab value="all" leftSection={<LayoutGrid size={14} />}>Tất cả</Tabs.Tab>
            {categories?.data?.map((cat: any) => (
              <Tabs.Tab key={cat.id} value={cat.id.toString()}>
                {cat.category_name}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
          {products?.data?.map((prod: any) => (
            <Card key={prod.id} shadow="sm" padding="lg" radius="md" withBorder style={{
              backgroundColor: '#1A1B1E',
              borderColor: '#373A40',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Card.Section>
                <Image
                  src={prod.image_url || 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png'}
                  height={160}
                  alt={prod.product_name}
                />
              </Card.Section>

              <Stack justify="space-between" mt="md" h="100%">
                <div>
                  <Group justify="space-between">
                    <Text fw={700}>{prod.product_name}</Text>
                    <Badge color="pink" variant="light">
                      Hot
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" mt="xs" lineClamp={2}>
                    {prod.description || 'Hương vị tuyệt vời từ đầu bếp IUH.'}
                  </Text>
                </div>

                <div>
                  <Text fw={900} size="xl" color="blue" mt="md">
                    {formatCurrency(Number(prod.price))}
                  </Text>

                  <Button
                    fullWidth
                    variant="light"
                    color="blue"
                    mt="md"
                    radius="md"
                    leftSection={<ShoppingCart size={18} />}
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
