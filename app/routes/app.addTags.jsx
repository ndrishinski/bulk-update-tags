// app/routes/app.addTags.jsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  ResourceList,
  Avatar,
  ResourceItem,
  Text,
  InlineGrid,
  TextField,
} from '@shopify/polaris';
import {DeleteIcon} from '@shopify/polaris-icons';
import { authenticate } from '../shopify.server'
import {
  useLoaderData,
  useActionData,
  useSubmit,
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
  // Authenticate admin
  const { admin } = await authenticate.admin(request);

  // Parse the form data
  const formData = await request.formData();
  const productIds = JSON.parse(formData.get('productIds')) || [] // Array of product IDs
  const tag = formData.get('tag'); // Tag string
  const isRemoval = formData.get('isRemoval')

  // Validate input
  if (!productIds || productIds.length === 0 || !tag) {
    console.error('Invalid input: Product IDs or tag missing.');
    return json({ success: false, message: 'Product IDs or tag missing.' });
  }

  const mutation = `
    mutation ${isRemoval === 'true' ? 'removeTags' : 'addTags'}($id: ID!, $tags: [String!]!) {
      ${isRemoval === 'true' ? 'tagsRemove' : 'tagsAdd'}(id: $id, tags: $tags) {
        node {
          id
        }
        userErrors {
          message
        }
      }
    }
  `;


  // Iterate over productIds and make GraphQL calls
  const results = await Promise.all(productIds.map(async (prodId) => {
    try {
      // Prepare variables for the mutation
      const variables = {
        id: prodId,
        tags: [tag]
      };
      
      // Execute the GraphQL mutation
      const response = await admin.graphql(mutation, { variables });
      const responseData = await response.json();
      const data = responseData.data
      const { userErrors } = data; 

      if (userErrors && userErrors.length > 0) {
        console.error(`User errors for product ${prodId}:`, userErrors);
        return { productId: prodId, success: false, userErrors };
      } else {
        console.log(`Successfully updated product ${prodId} with tag "${tag}".`);
        return { productId: prodId, success: true };
      }
    } catch (error) {
      console.error(`Failed to update product ${prodId}:`, error);
      return { productId: prodId, success: false, error: error.message };
    }
  }));
  // Return the results
  return json({ success: true, results });
};


const AppAddTags = () => {
    const [selectedItems, setSelectedItems] = useState([]);

    const allProducts = useLoaderData();
    const data = useActionData()

    const submit = useSubmit()

    const [value, setValue] = useState('');
    const [allProds, setAllProds] = useState([]);
    const [successful, setSuccessful] = useState(false);
    const [isRemoval, setIsRemoval] = useState(false);

    const handleChange = useCallback(
      (newValue) => setValue(newValue),
      [],
    );
    useEffect(() => {
      if (data?.success) {
        setSuccessful(true);
        setTimeout(() => setSuccessful(false), 2000);
      }
    }, [data]);

    useEffect(() => {
      const tempProducts = allProducts.data.data.products.edges;
      const updatedAllProds = tempProducts.map(i => {
        return {id: i.node.id, title: i.node.title, featuredMedia: i.node.featuredMedia?.preview?.image?.url || '', tags: i.node.tags || []}
      });
      setAllProds([...updatedAllProds]);
    }, [allProducts]);

    const handleTagUpate = (event) => {
      const formData = new FormData();
      formData.append('productIds', JSON.stringify(selectedItems));
      formData.append('tag', value);
      formData.append('isRemoval', isRemoval)

      console.log('testing the prod ids: ', selectedItems)
    
      submit(formData, { method: 'post', encType: 'multipart/form-data' });
      setSelectedItems([])
    };

    const resourceName = {
      singular: 'Product',
      plural: 'Products'
    }

    const promotedBulkActions = [
      {
        content: 'Add Tag',
        onAction: (e) => {
          setIsRemoval(false)
          handleTagUpate(e)
        },
      },
      {
        content: 'Remove Tag',
        onAction: (e) => {
          setIsRemoval(true)
          handleTagUpate(e)
        },
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
        {successful && (
          <Text variant="headingXl" as="h4">Successfully Updated</Text>
        )}
        <Form method="POST">
          <TextField
            label="Tag Add / Removal"
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
          </Form>
      </Card>
    );
};

export default AppAddTags;



function renderItem({id, title, featuredMedia, tags}) {
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
          {tags.map((tag) => (
            <span key={tag} style={{ marginLeft: '8px' }}>
              {tag}
            </span>
          ))}
        </Text>

        <div>ID: {id}</div>
      </InlineGrid>
    </ResourceItem>
  );
}