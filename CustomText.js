import React from 'react';
import { Text } from 'react-native';

const CustomText = ({ style, children, ...props }) => {
  return (
    <Text style={[style, { fontFamily: 'Minecraft Regular' }]} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;