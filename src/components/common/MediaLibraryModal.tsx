'use client';

import React, { useState } from 'react';
import { Modal, Text, Image, Button, Group, Box, Loader, Stack, ActionIcon, Center, SimpleGrid, Card, FileButton, Paper, ScrollArea, Divider } from '@mantine/core';
import { Upload, X, Check, ImageIcon as IconImage, CheckCircle2, Calendar, Scissors, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

interface MediaLibraryModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentImageUrl?: string;
}

/**
 * Modal Thư viện Media (WordPress Style)
 * Có Sidebar xem trước và thông tin ảnh khi click chọn
 */
export default function MediaLibraryModal({
  opened,
  onClose,
  onSelect,
  currentImageUrl = ''
}: MediaLibraryModalProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentImageUrl || null);

  // 1. Fetch Danh sách hình ảnh từ DB
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['media-gallery'],
    queryFn: async () => (await https.get('/media')).data,
    enabled: opened
  });

  const gallery = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  
  // Lấy chi tiết tấm ảnh đang chọn
  const selectedDetails = gallery.find((img: any) => img.url === selectedUrl);

  // 2. Mutation Tải lên
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return https.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['media-gallery'] });
      notifications.show({ title: 'Thành công', message: 'Đã tải ảnh lên thư viện', color: 'green' });
      setIsUploading(false);
      setSelectedUrl(res.data.url);
    },
    onError: (err: any) => {
      notifications.show({ title: 'Lỗi', message: 'Không thể tải lên', color: 'red' });
      setIsUploading(false);
    }
  });

  const handleUpload = (file: File | null) => {
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={<Text fw={900} size="xl" className="text-blue-800 uppercase">Thư viện Hình ảnh</Text>}
      size="85vw" // Làm modal to ra để có không gian cho sidebar
      radius="lg"
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 5 }}
    >
      <Stack gap="lg">
        <Group justify="space-between">
           <Text size="sm" c="dimmed">Chọn ảnh sẵn có từ thư viện hoặc tải lên tệp mới.</Text>
           <FileButton onChange={handleUpload} accept="image/*">
             {(props) => (
                <Button 
                  {...props} 
                  variant="filled" 
                  color="blue"
                  leftSection={isUploading ? <Loader size={14} color="white" /> : <Upload size={16} />}
                  loading={isUploading}
                >
                  Tải ảnh lên máy chủ
                </Button>
             )}
           </FileButton>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 4 }} spacing="xl">
          {/* CỘT TRÁI: GRID HÌNH ẢNH (3/4 chiều rộng) */}
          <Box style={{ gridColumn: 'span 3' }}>
            <ScrollArea h={500} offsetScrollbars type="always">
              {isLoading ? (
                 <Center h={400}><Loader variant="bars" /></Center>
              ) : gallery.length === 0 ? (
                <Center h={400} className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                   <Stack align="center" gap="sm">
                      <IconImage size={48} className="text-slate-200" />
                      <Text c="dimmed">Thư viện trống.</Text>
                   </Stack>
                </Center>
              ) : (
                 <SimpleGrid cols={{ base: 2, sm: 4, md: 5, lg: 6 }} spacing="md" p="xs">
                    {gallery.map((img: any) => (
                       <Card 
                         key={img.id} 
                         p="0" 
                         radius="md" 
                         withBorder 
                         className={`cursor-pointer transition-all relative aspect-square group overflow-hidden ${selectedUrl === img.url ? 'ring-4 ring-blue-500 border-blue-500' : 'hover:border-blue-400'}`}
                         onClick={() => setSelectedUrl(img.url)}
                       >
                         <Image src={img.url} alt="img" className="object-cover w-full h-full" />
                         {selectedUrl === img.url && (
                            <Box className="absolute top-1 right-1 bg-blue-500 rounded-full p-1 text-white shadow-xl z-10">
                               <Check size={16} />
                            </Box>
                         )}
                       </Card>
                    ))}
                 </SimpleGrid>
              )}
            </ScrollArea>
          </Box>

          {/* CỘT PHẢI: CHI TIẾT & PREVIEW (1/4 chiều rộng) */}
          <Box className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col h-[500px]">
             {selectedUrl ? (
                <Stack gap="md" style={{ height: '100%' }}>
                   <Text fw={800} size="sm" c="blue" tt="uppercase">Chi tiết tệp tin</Text>
                   
                   <Paper withBorder radius="md" p="xs" className="bg-white overflow-hidden shadow-sm">
                      <Image src={selectedUrl} radius="sm" fit="contain" mah={180} />
                   </Paper>

                   <ScrollArea style={{ flex: 1 }}>
                      <Stack gap="xs">
                         <div className="bg-white p-2 rounded border border-slate-100">
                            <Text size="xs" fw={700} c="dimmed" mb={2}>ĐƯỜNG DẪN ẢNH:</Text>
                            <Paper p="xs" bg="slate.0" withBorder style={{ wordBreak: 'break-all' }}>
                               <Text size="xs" className="font-mono" c="blue">{selectedUrl}</Text>
                            </Paper>
                         </div>

                         {selectedDetails && (
                            <Stack gap="xs" mt="sm">
                               <Group gap="xs">
                                  <Calendar size={14} className="text-slate-400" />
                                  <Text size="xs" fw={600}>Ngày tải: {dayjs(selectedDetails.created_at).format('DD/MM/YYYY')}</Text>
                               </Group>
                               <Group gap="xs">
                                  <Scissors size={14} className="text-slate-400" />
                                  <Text size="xs" fw={600}>ID: {selectedDetails.public_id?.split('/')[1] || 'Tệp tải lên'}</Text>
                               </Group>
                            </Stack>
                         )}
                      </Stack>
                   </ScrollArea>

                   <Button 
                      variant="light" 
                      color="blue" 
                      size="xs" 
                      fullWidth 
                      leftSection={<ExternalLink size={14} />}
                      component="a"
                      href={selectedUrl}
                      target="_blank"
                   >
                      Mở tệp gốc
                   </Button>
                </Stack>
             ) : (
                <Center h="100%">
                   <Stack align="center" gap="xs">
                      <IconImage size={40} className="text-slate-300" />
                      <Text size="xs" c="dimmed" ta="center">Chọn một hình ảnh để xem chi tiết.</Text>
                   </Stack>
                </Center>
             )}
          </Box>
        </SimpleGrid>

        <Divider />

        {/* Thanh công cụ dưới cùng */}
        <Group justify="space-between" p="sm" className="bg-blue-50/50 rounded-xl">
           <Box>
              {selectedUrl && (
                <Group gap="sm">
                   <CheckCircle2 size={18} className="text-blue-600" />
                   <Text size="sm" fw={700} c="blue-9">Đã chọn 1 hình ảnh.</Text>
                </Group>
              )}
           </Box>
           <Group>
              <Button variant="subtle" color="gray" onClick={onClose} size="md">Đóng lại</Button>
              <Button 
                variant="filled" 
                color="blue" 
                onClick={handleConfirmSelect} 
                disabled={!selectedUrl}
                size="md"
                className="shadow-lg px-10"
                radius="md"
              >
                Xác nhận chọn hình ảnh
              </Button>
           </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
