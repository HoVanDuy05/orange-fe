'use client';

import { Text, Image, Button, Group, Box, Loader, Stack, ActionIcon, Center, SimpleGrid, Card, FileButton, Paper, ScrollArea, Divider, Tabs } from '@mantine/core';
import { AppModal } from './AppModal';
import { Upload, X, Check, ImageIcon as IconImage, CheckCircle2, Calendar, Scissors, ExternalLink, LayoutGrid, Package, Palette, UserCircle, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { useState } from 'react';
import { MediaGallery } from './MediaGallery';

interface MediaLibraryModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentImageUrl?: string;
  folder?: string; // Tên folder gợi ý (nếu có thì ẩn thanh Tab đi)
}

export default function MediaLibraryModal({
  opened,
  onClose,
  onSelect,
  currentImageUrl = '',
  folder = ''
}: MediaLibraryModalProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentImageUrl || null);
  const [activeFolder, setActiveFolder] = useState<string>(folder || 'all');

  // 1. Fetch Danh sách hình ảnh từ DB (Chỉ dùng lấy chi tiết ảnh đang chọn)
  const { data: rawData } = useQuery({
    queryKey: ['media-gallery', activeFolder],
    queryFn: async () => (await https.get(`/media`, { params: { folder: activeFolder === 'all' ? undefined : activeFolder } })).data,
    enabled: opened
  });

  const gallery = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  const selectedDetails = gallery.find((img: any) => img.url === selectedUrl);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', activeFolder || 'uncategorized');
      return https.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['media-gallery', activeFolder] });
      notifications.show({ title: 'Thành công', message: `Đã cập nhật tệp tin mới nhất.`, color: 'green' });
      setIsUploading(false);
      setSelectedUrl(res.data.url);
    },
    onError: () => {
      notifications.show({ title: 'Lỗi tải lên', message: 'Tệp không đúng định dạng hoặc quá lớn.', color: 'red' });
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
    <AppModal 
      opened={opened} 
      onClose={onClose} 
      title="Lọc và Chọn tập tin"
      subtitle="Quản lý và chọn tài nguyên hình ảnh toàn hệ thống"
      size="88vw"
      centered
      actions={
        <Group justify="space-between" w="100%">
           <Box>
              {selectedUrl && (
                <Group gap="sm">
                  <Box className="w-10 h-10 rounded-xl bg-brand-soft border border-brand-soft flex items-center justify-center shadow-sm">
                     <CheckCircle2 size={20} className="text-brand" />
                  </Box>
                  <Stack gap={0}>
                     <Text size="xs" fw={900} c="brand.9">Đã chọn 01 tập tin</Text>
                     <Text size="10px" c="dimmed" fw={600}>Hệ thống đã sẵn sàng</Text>
                  </Stack>
                </Group>
              )}
           </Box>
           <Group gap="md">
             <Button variant="subtle" color="gray" onClick={onClose} radius="md" size="md" fw={700}>Đóng lại</Button>
             <Button 
               variant="filled" 
               color="brand" 
               onClick={handleConfirmSelect} 
               disabled={!selectedUrl}
               radius="md"
               size="md"
               className="px-12 shadow-xl hover:shadow-2xl transition-all"
               fw={800}
             >
               Xác nhận áp dụng
             </Button>
           </Group>
        </Group>
      }
    >
      <Box className="flex flex-col h-[70vh] -m-xl overflow-hidden">
        {/* Header Actions - Chỉ hiện Tab nếu không có folder chỉ định */}
        <Box p="md" className="border-b border-slate-100 bg-slate-50/20">
          <Group justify="space-between" align="center">
            {/* ẨN LOẠI (TAB) ĐI NẾU ĐÃ CỐ ĐỊNH FOLDER */}
            {!folder ? (
              <Tabs variant="pills" value={activeFolder} onChange={(v) => setActiveFolder(v || 'all')} radius="xl" color="brand">
                <Tabs.List className="bg-white p-1 shadow-sm border border-slate-100 rounded-full">
                  <Tabs.Tab value="all" leftSection={<LayoutGrid size={16} />} fw={700}>Tất cả</Tabs.Tab>
                  <Tabs.Tab value="product" leftSection={<Package size={16} />} fw={700}>Sản phẩm</Tabs.Tab>
                  <Tabs.Tab value="logo" leftSection={<Palette size={16} />} fw={700}>Thương hiệu</Tabs.Tab>
                  <Tabs.Tab value="avatar" leftSection={<UserCircle size={16} />} fw={700}>Người dùng</Tabs.Tab>
                  <Tabs.Tab value="uncategorized" leftSection={<Settings size={16} />} fw={700}>Khác</Tabs.Tab>
                </Tabs.List>
              </Tabs>
            ) : (
              <Group gap="xs">
                 <Box className="w-1.5 h-6 bg-brand rounded-full" />
                 <Text fw={900} size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: '1px' }}>Thư mục: {folder}</Text>
              </Group>
            )}

            <FileButton onChange={handleUpload} accept="image/*">
              {(props) => (
                <Button 
                  {...props} 
                  variant="filled" 
                  color="brand"
                  radius="md"
                  leftSection={isUploading ? <Loader size={14} color="white" /> : <Upload size={16} />}
                  loading={isUploading}
                  className="shadow-lg"
                  size="sm"
                >
                  Thêm tệp mới
                </Button>
              )}
            </FileButton>
          </Group>
        </Box>

        <Box className="flex-1 overflow-hidden" bg="white">
          <SimpleGrid cols={{ base: 1, md: 4 }} spacing="0" h="100%">
            {/* GRID HÌNH ẢNH */}
            <Box style={{ gridColumn: 'span 3' }} className="border-r border-slate-100 h-full bg-white">
              <ScrollArea h="100%" p="xl" offsetScrollbars>
                <MediaGallery 
                  folder={activeFolder} 
                  selectedUrl={selectedUrl} 
                  onSelect={setSelectedUrl} 
                />
              </ScrollArea>
            </Box>

            {/* SIDEBAR PREVIEW */}
            <Box className="bg-slate-50/10 p-6 flex flex-col h-full overflow-hidden shadow-inner">
              {selectedUrl ? (
                <Stack gap="xl" h="100%">
                  <Box>
                    <Text fw={900} size="xs" c="brand" tt="uppercase" mb="md" style={{ letterSpacing: '1px' }}>Xem trước tệp</Text>
                    <Paper withBorder radius="xl" p={6} bg="white" styles={{ root: { borderColor: '#f1f5f9' } }} className="shadow-2xl overflow-hidden border-2 border-brand-soft">
                      <Image src={selectedUrl} radius="lg" fit="contain" mah={240} className="hover:scale-105 transition-transform" />
                    </Paper>
                  </Box>

                  <ScrollArea flex={1}>
                    <Stack gap="lg">
                      <Box>
                        <Text size="10px" fw={800} c="dimmed" mb={8} tt="uppercase">ĐƯỜNG DẪN TRUY CẬP</Text>
                        <Paper p="xs" radius="md" bg="white" withBorder styles={{ root: { borderColor: '#f1f5f9' } }} className="border-dashed border-slate-200">
                          <Text size="xs" className="font-mono select-all leading-tight" c="brand.8" style={{ wordBreak: 'break-all' }}>{selectedUrl}</Text>
                        </Paper>
                      </Box>

                      {selectedDetails && (
                        <Box className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                           <Stack gap="sm">
                              <Group justify="space-between">
                                 <Text size="10px" fw={800} c="dimmed">NGÀY ĐĂNG</Text>
                                 <Text size="xs" fw={700}>{dayjs(selectedDetails.created_at).format('DD/MM/YYYY')}</Text>
                              </Group>
                              <Group justify="space-between">
                                 <Text size="10px" fw={800} c="dimmed">TÊN GỐC</Text>
                                 <Text size="xs" fw={700} truncate w={100}>{selectedDetails.public_id?.split('/')[1] || 'Media-File'}</Text>
                              </Group>
                           </Stack>
                        </Box>
                      )}
                    </Stack>
                  </ScrollArea>

                  <Button 
                    variant="light" 
                    color="gray" 
                    size="sm" 
                    fullWidth 
                    radius="md"
                    leftSection={<ExternalLink size={14} />}
                    component="a"
                    href={selectedUrl}
                    target="_blank"
                    className="hover:bg-slate-200"
                  >
                    Mở tệp gốc
                  </Button>
                </Stack>
              ) : (
                <Center h="100%">
                  <Stack align="center" gap="md">
                    <Box p="lg" className="bg-slate-50 rounded-full border-2 border-dashed border-slate-100">
                       <IconImage size={48} className="text-slate-300" />
                    </Box>
                    <Text size="xs" c="dimmed" ta="center" px="xl" fw={700} tt="uppercase" style={{ letterSpacing: '1px' }}>Nhấp chọn ảnh để xem chi tiết</Text>
                  </Stack>
                </Center>
              )}
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
    </AppModal>
  );
}
