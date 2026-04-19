import React from 'react';
import { Card, List, Divider } from 'react-native-paper';

const ProfileInfoRow = ({ title, icon, items = [] }) => {
  return (
    <Card mode="elevated" elevation={1}>
      <Card.Title
        title={title}
        titleVariant="labelLarge"
        left={(props) => <List.Icon {...props} icon={icon} />}
      />

      <Card.Content style={{ gap: 0 }}>
        {items.map((item, index) => (
          <React.Fragment key={item.key || index}>
            <List.Item
              style={{ paddingVertical: 3, paddingHorizontal: 6 }}
              title={item.title}
              description={item.description}
              titleStyle={{ fontSize: 14 }}
              left={(props) =>
                item.icon ? <List.Icon {...props} icon={item.icon} /> : null
              }
              right={item.right}
            />

            {index < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Card.Content>
    </Card>
  );
};

export default ProfileInfoRow;