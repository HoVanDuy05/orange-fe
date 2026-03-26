'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { 
  Title, Card, Text, Group, Button, SimpleGrid, Image, Stack, 
  ActionIcon, Badge, FileButton, Loader, Center, Paper, Tooltip, 
  Modal, Box, Title as MantineTitle
} from '@mantine/core';
import { Upload, Trash2, Maximize2, ExternalLink, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';
import dayjs from 'dayjs';

export default function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // 1. Fetch Danh sách hình ảnh từ DB
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['media-gallery'],
    queryFn: async () => (await https.get('/media')).data
  });

  const gallery = Array.isArray(rawData) ? rawData : (rawData?.data || []);

  // 2. Mutation Tải lên
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return https.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-gallery'] });
      notifications.show({ title: 'Thành công', message: 'Đã tải ảnh lên thư viện', color: 'green' });
      setUploading(false);
    },
    onError: (err: any) => {
      notifications.show({ title: 'Lỗi', message: err.response?.data?.message || 'Không thể tải lên', color: 'red' });
      setUploading(false);
    }
  });

  // 3. Mutation Xoá
  const deleteMutation = useMutation({
    mutationFn: (id: number) => https.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-gallery'] });
      notifications.show({ title: 'Đã xoá', message: 'Ảnh đã được gỡ khỏi hệ thống', color: 'orange' });
      setSelectedImage(null);
    }
  });

  const handleUpload = (file: File | null) => {
    if (file) {
      setUploading(true);
      uploadMutation.mutate(file);
    }
  };

  if (isLoading) return <SectionLoader />;

  return (
    <Stack gap="xl" p="md">
      <Group justify="space-between" align="center">
        <Stack gap={2}>
           <Title order={1} className="text-slate-800 font-extrabold text-4xl">Thư viện Hình ảnh</Title>
           <Text size="md" c="dimmed" fw={500}>Quản lý và lưu trữ tài nguyên hình ảnh toàn hệ thống</Text>
        </Stack>

        <FileButton onChange={handleUpload} accept="image/png,image/jpeg,image/webp">
          {(props) => (
            <Button 
              {...props} 
              leftSection={uploading ? <Loader size={16} color="white" /> : <Upload size={18} />} 
              size="lg" 
              radius="md" 
              color="blue"
              className="shadow-xl px-8"
              loading={uploading}
            >
              Thêm ảnh mới
            </Button>
          )}
        </FileButton>
      </Group>

      {gallery.length === 0 ? (
        <Center h={400} className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
           <Stack align="center" gap="md">
             <ImageIcon size={60} className="text-slate-300" />
             <Text c="dimmed" fw={600}>Thư viện đang trống rỗng. Hãy tải tấm ảnh đầu tiên lên!</Text>
           </Stack>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing="lg">
          {gallery.map((img: any) => (
            <Card 
              key={img.id} 
              p="xs" 
              radius="lg" 
              withBorder 
              shadow="sm" 
              className="group hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => setSelectedImage(img)}
            >
              <Card.Section className="relative overflow-hidden aspect-square">
                 <Image 
                   src={img.url} 
                   alt="gallery" 
                   className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                 />
                 <Box className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <ActionIcon variant="filled" color="blue" radius="xl" size="lg"><Maximize2 size={18} /></ActionIcon>
                 </Box>
              </Card.Section>
              
              <Group justify="space-between" mt="xs" gap={4}>
                 <Text size="xs" c="dimmed" truncate>{dayjs(img.created_at).format('DD/MM/YYYY')}</Text>
                 <Badge size="xs" color="gray" variant="dot">IMAGE</Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal 
        opened={!!selectedImage} 
        onClose={() => setSelectedImage(null)} 
        title={<Text fw={900} size="xl" className="text-blue-800 uppercase">Thông tin Hình ảnh</Text>}
        size="lg"
        radius="lg"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 5 }}
      >
        {selectedImage && (
          <Stack gap="xl">
            <Paper withBorder radius="md" bg="slate.0" style={{ overflow: 'hidden' }} shadow="sm">
               <Image 
                 src={selectedImage.url} 
                 alt="full" 
                 radius="md" 
                 fit="contain" 
                 mah={400} 
                 fallbackSrc="https://placehold.co/600x400?text=No+Image"
               />
            </Paper>
            
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Stack gap="md">
                 <Box>
                   <Text size="xs" fw={700} c="dimmed" mb={4}>ĐƯỜNG DẪN ẢNH (URL):</Text>
                   <Paper p="xs" withBorder bg="gray.0" style={{ wordBreak: 'break-all' }} radius="xs">
                      <Text size="xs" className="select-all font-mono" c="blue.7">{selectedImage.url}</Text>
                   </Paper>
                 </Box>

                 <Button 
                   leftSection={<ExternalLink size={16} />} 
                   variant="light" 
                   component="a" 
                   href={selectedImage.url} 
                   target="_blank"
                   fullWidth
                 >
                   Xem ảnh gốc trong tab mới
                 </Button>
              </Stack>

              <Stack gap="md" justify="space-between">
                 <Box className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <Stack gap="xs">
                       <Group justify="space-between">
                          <Text size="xs" fw={700} c="dimmed">PUBLIC ID:</Text>
                          <Text size="xs" fw={600} truncate w={120}>{selectedImage.public_id || 'N/A'}</Text>
                       </Group>
                       <Group justify="space-between">
                          <Text size="xs" fw={700} c="dimmed">NGÀY TẢO:</Text>
                          <Text size="xs" fw={600}>{dayjs(selectedImage.created_at).format('DD/MM/YYYY HH:mm')}</Text>
                       </Group>
                       <Group justify="space-between">
                          <Text size="xs" fw={700} c="dimmed">ĐỊNH DẠNG:</Text>
                          <Badge size="xs" variant="dot">IMAGE/JPG</Badge>
                       </Group>
                    </Stack>
                 </Box>

                 <Button 
                   color="red" 
                   variant="filled" 
                   leftSection={<Trash2 size={18} />}
                   loading={deleteMutation.isPending}
                   className="shadow-md"
                   onClick={() => modals.openConfirmModal({
                     title: 'Xác nhận xoá vĩnh viễn',
                     children: <Text size="sm">Hành động này sẽ gỡ bỏ ảnh khỏi Cloudinary và Database. Bạn chắc chứ?</Text>,
                     labels: { confirm: 'Xoá ngay', cancel: 'Bỏ qua' },
                     confirmProps: { color: 'red' },
                     onConfirm: () => deleteMutation.mutate(selectedImage.id)
                   })}
                 >
                   Xoá ảnh vĩnh viễn
                 </Button>
              </Stack>
            </SimpleGrid>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
