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
  Form,
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

export const action = async ({ request }) => {
  console.log('YOOOO NICKI GOT TO HERE!! ', request)
  const { admin } = await authenticate.admin(request)
  const response = await admin.graphql(
    `#graphql
    mutation UpdateProductWithNewMedia($input, $tags) {
      productUpdate(input: $input, tags: $tags) {
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
          "id": prodId
        },
        "tags": [
          value
        ]
      },
    },
  );
  console.log('yooo checking uno 2', prodId)
  const data = await response.json();
  console.log('yooo checking uno', data)
}

const AppAddTags = () => {
    const [selectedItems, setSelectedItems] = useState([]);

    const allProducts = useLoaderData();
    // const data = useActionData()

    const [value, setValue] = useState('');

    const handleChange = useCallback(
      (newValue) => setValue(newValue),
      [],
    );
    let tempProducts = allProducts.data.data.products.edges
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
    const tagGraphqlQuery = async (prodId) => {
      // TODO: call action
    }

    const handleTagAddition = () => {
        // Logic to add tags to selected products
        console.log('Adding tags to:', selectedItems);
        selectedItems.map(prodId => {
          tagGraphqlQuery(prodId)
        })
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
        content: 'Add Tagz',
        onAction: () => handleTagAddition(),
      },
      {
        content: 'Remove Tag',
        onAction: () => handleTagRemoval(),
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
        <Form method="post">
          <TextField
            label="Bulk Tag Add"
            value={value}
            onChange={handleChange}
            autoComplete="off"
          />
        </Form>
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