// app/routes/app.addTags.jsx
import React, { useState, useEffect } from 'react';
import {
  LegacyCard,
  ResourceList,
  Avatar,
  ResourceItem,
  Text,
} from '@shopify/polaris';
import {DeleteIcon} from '@shopify/polaris-icons';
import { authenticate } from '../shopify.server'
import {
  useLoaderData,
} from "@remix-run/react";
import { json } from '@remix-run/node';

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request)

  try {
    const response = await admin.graphql(
      `{
        products(first: 10) {
            edges {
                node {
                    id
                    title
                    featuredMedia {
                      id
                    }
                    tags
                }
            }
        }
      }`
    )

    const parsed = await response.json()

    return json({ data: parsed})
  } catch (error) {
    console.error('Error fetching products:', error)
    return json({ data: [] })
  }
};

const AppAddTags = () => {
    const [selectedItems, setSelectedItems] = useState([]);

    const qrCode = useLoaderData();
    let tempProducts = qrCode.data.data.products.edges
    const allProds = tempProducts.map(i => {
      return {id: i.node.id, title: i.node.title, featuredMedia: i.node.featuredMedia?.id || '', tags: i.node.tags || []}
    })

    const handleCheckboxChange = (id) => {
        setSelectedItems((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter(item => item !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    const handleTagAddition = () => {
        // Logic to add tags to selected products
        console.log('Adding tags to:', selectedItems);
    };

    const resourceName = {
      singular: 'Product',
      plural: 'Products'
    }

    const promotedBulkActions = [
      {
        content: 'Edit customers',
        onAction: () => console.log('Todo: implement bulk edit'),
      },
    ];
  
    const bulkActions = [
      {
        content: 'Add tags',
        onAction: () => console.log('Todo: implement bulk add tags'),
      },
      {
        content: 'Remove tags',
        onAction: () => console.log('Todo: implement bulk remove tags'),
      },
      {
        icon: DeleteIcon,
        destructive: true,
        content: 'Delete customers',
        onAction: () => console.log('Todo: implement bulk delete'),
      },
    ];

    return (
      <LegacyCard>
        <ResourceList
          resourceName={resourceName}
          items={allProds}
          renderItem={renderItem}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          promotedBulkActions={promotedBulkActions}
          bulkActions={bulkActions}
        />
      </LegacyCard>
    );
};

export default AppAddTags;



function renderItem(item) {
  const {id, title, featuredMedia, tags} = item;
  const media = <Avatar product size="md" name={title} source={featuredMedia} />;
 // TODO: Get avatar to show product image, also format horizontal
  return (
    <ResourceItem
      id={id}
      url={'#'}
      media={media}
      accessibilityLabel={`View details for ${title}`}
    >
      <Text variant="bodyMd" fontWeight="bold" as="h3">
        {title}
      </Text>
      <div>Product Id: {id}</div>
      <Text variant='bodyMd'>
        {tags.map(tag => <p>{tag}</p>)}
      </Text>
    </ResourceItem>
  );
}