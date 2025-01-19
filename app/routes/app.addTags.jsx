// app/routes/app.addTags.jsx
import React, { useState, useCallback } from 'react';
import {
  Card,
  ResourceList,
  Avatar,
  ResourceItem,
  Text,
  InlineGrid,
  TextField
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
                      preview {
                        image {
                          id
                          url
                        }
                      }
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

    const [value, setValue] = useState('');

    const handleChange = useCallback(
      (newValue) => setValue(newValue),
      [],
    );
    let tempProducts = qrCode.data.data.products.edges
    const allProds = tempProducts.map(i => {
      return {id: i.node.id, title: i.node.title, featuredMedia: i.node.featuredMedia?.preview?.image?.url || '', tags: i.node.tags || []}
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

    // TODO: get this query working adding / removing 
    const tagGraphqlQuery = async () => {
      const response = await admin.graphql(
        `#graphql
        mutation UpdateProductWithNewMedia($input: ProductInput!, $media: [CreateMediaInput!]) {
          productUpdate(input: $input, media: $media) {
            product {
              id
              media(first: 10) {
                nodes {
                  alt
                  mediaContentType
                  preview {
                    status
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }`,
        {
          variables: {
            "input": {
              "id": "gid://shopify/Product/912855135" // product ID
            },
            "media": [
              {
                "originalSource": "https://cdn.shopify.com/shopifycloud/brochure/assets/sell/image/image-@artdirection-large-1ba8d5de56c361cec6bc487b747c8774b9ec8203f392a99f53c028df8d0fb3fc.png",
                "alt": "Gray helmet for bikers",
                "mediaContentType": "IMAGE"
              },
              {
                "originalSource": "https://www.youtube.com/watch?v=4L8VbGRibj8&list=PLlMkWQ65HlcEoPyG9QayqEaAu0ftj0MMz",
                "alt": "Testing helmet resistance against impacts",
                "mediaContentType": "EXTERNAL_VIDEO"
              }
            ]
          },
        },
      );
      
      const data = await response.json();
    }

    const handleTagAddition = () => {
        // Logic to add tags to selected products
        console.log('Adding tags to:', selectedItems);
    };
    
    const handleTagRemoval = () => {
        // Logic to add tags to selected products
        console.log('Removing Tags from:', selectedItems);
    };

    const resourceName = {
      singular: 'Product',
      plural: 'Products'
    }

    const promotedBulkActions = [
      {
        content: 'Add Tag',
        onAction: () => console.log('Todo: implement bulk edit'),
      },
      {
        content: 'Remove Tag',
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
      <Card>
        <TextField
          label="Bulk Tag Add"
          value={value}
          onChange={handleChange}
          autoComplete="off"
        />
        <ResourceList
          resourceName={resourceName}
          items={allProds}
          renderItem={renderItem}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          promotedBulkActions={promotedBulkActions}
          bulkActions={bulkActions}
        />
      </Card>
    );
};

export default AppAddTags;



function renderItem(item) {
  const {id, title, featuredMedia, tags} = item;
  const media = <Avatar customer={false} size="md" name={title} source={featuredMedia} />;
 return (
  <ResourceItem
    id={id}
    url={'#'}
    media={media}
    accessibilityLabel={`View details for ${title}`}
  >
    <InlineGrid columns={3}>
      <Text variant="bodyMd" fontWeight="bold" as="h3">
        {title}
      </Text>

      <Text variant="bodyMd">
        {tags.map((tag, index) => (
          <span key={index} style={{ marginLeft: '8px' }}>
            {tag}
          </span>
        ))}
      </Text>

    <div>ID: {id}</div>
    </InlineGrid>
  </ResourceItem>
);
}