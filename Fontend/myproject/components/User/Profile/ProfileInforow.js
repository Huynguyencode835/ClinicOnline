import COLORS from '../../../styles/Colors';

import React from 'react';
import { Card, List, Divider } from 'react-native-paper';

const ProfileInfoRow = ({ title, icon, items = [] }) => {
  return (
    <Card
      mode="elevated"
      elevation={1}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 12,
      }}
    >
      <Card.Title
        title={title}
        titleVariant="labelLarge"
        titleStyle={{
          color: COLORS.primary,
          fontWeight: '600',
        }}
        left={(props) => (
          <List.Icon
            {...props}
            icon={icon}
            color={COLORS.primary}
          />
        )}
      />

      <Card.Content style={{ gap: 0 }}>
        {items.map((item, index) => (
          <React.Fragment key={item.key || index}>
            <List.Item
              style={{
                paddingVertical: 6,
                paddingHorizontal: 6,
              }}
              title={item.title}
              description={item.description}
              titleStyle={{
                fontSize: 14,
                color: COLORS.text,
                fontWeight: '500',
              }}
              descriptionStyle={{
                color: COLORS.textMuted,
                fontSize: 12,
              }}
              left={(props) =>
                item.icon ? (
                  <List.Icon
                    {...props}
                    icon={item.icon}
                    color={COLORS.textMuted}
                  />
                ) : null
              }
              right={item.right}
            />

            {index < items.length - 1 && (
              <Divider
                style={{
                  backgroundColor: COLORS.divider,
                  marginHorizontal: 6,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Card.Content>
    </Card>
  );
};

export default ProfileInfoRow;