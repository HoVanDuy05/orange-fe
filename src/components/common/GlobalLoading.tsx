import { LoadingOverlay, Center, Loader, Box } from '@mantine/core';
import React from 'react';

/**
 * Thẻ Loading dùng chung cho toàn hệ thống
 * @param visible - Trạng thái hiển thị
 * @returns JSX.Element
 */
export const GlobalLoading = ({ visible }: { visible: boolean }) => {
  return (
    <LoadingOverlay 
      visible={visible} 
      zIndex={3000} 
      overlayProps={{ radius: "sm", blur: 2 }} 
      loaderProps={{ color: 'blue', type: 'bars' }}
    />
  );
};

// Component Loading cho từng khu vực (dùng trong map, table...)
export const SectionLoader = () => (
  <Center h={200} w="100%">
    <Loader color="blue" type="dots" size="xl" />
  </Center>
);

// Component Loading toàn màn hình (dùng trong Root Layout/Auth)
export const FullPageLoader = () => (
  <Box style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyItems: 'center', backgroundColor: '#f0f9ff' }}>
    <Center style={{ flex: 1 }}>
       <Loader color="blue" type="bars" size="xl" />
    </Center>
  </Box>
);
