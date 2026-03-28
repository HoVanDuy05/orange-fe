'use client';

import React, { useState } from 'react';
import { Image, Box, Loader, Stack, Center, SimpleGrid, Card, Text } from '@mantine/core';
import { ImageIcon as IconImage, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import https from '@/api/https';
import dayjs from 'dayjs';

interface MediaGalleryProps {
  folder?: string;
  selectedUrl: string | null;
  onSelect: (url: string) => void;
  isLoading?: boolean;
}

/**
 * Thành phần lưới hình ảnh (Tách rã logic hiển thị)
 */
export const MediaGallery = ({ folder, selectedUrl, onSelect }: MediaGalleryProps) => {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['media-gallery', folder],
    queryFn: async () => (await https.get(`/media`, { params: { folder: folder || undefined } })).data
  });

  const gallery = Array.isArray(rawData) ? rawData : (rawData?.data || []);

  if (isLoading) {
    return <Center h={400}><Loader variant="bars" color="brand" /></Center>;
  }

  if (gallery.length === 0) {
    return (
      <Center h={400} className="bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-200">
        <Stack align="center" gap="sm">
          <IconImage size={48} className="text-slate-200" />
          <Text c="dimmed" fw={600}>Thư mục này hiện chưa có nội dung.</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <SimpleGrid cols={{ base: 2, sm: 4, md: 5, lg: 6 }} spacing="md">
      {gallery.map((img: any) => (
        <Card
          key={img.id}
          p="0"
          radius="lg"
          withBorder
          className={`cursor-pointer transition-all relative aspect-square group overflow-hidden ${selectedUrl === img.url ? 'ring-4 ring-brand border-brand shadow-xl scale-[0.98]' : 'hover:border-brand-soft hover:shadow-md'}`}
          onClick={() => onSelect(img.url)}
        >
          <Image src={img.url} alt="media" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
          {selectedUrl === img.url && (
            <Box className="absolute top-2 right-2 bg-brand rounded-full p-1.5 text-white shadow-2xl z-10 animate-in zoom-in duration-300">
              <Check size={16} strokeWidth={3} />
            </Box>
          )}
          <Box className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <Text size="10px" c="white" fw={700}>{dayjs(img.created_at).format('DD/MM/YYYY')}</Text>
          </Box>
        </Card>
      ))}
    </SimpleGrid>
  );
};
