// app/routes/app.addTags.jsx
import React, { useState, useEffect } from 'react';
import { Page, Card, Checkbox, Button, DataTable } from '@shopify/polaris';
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
      return {id: i.node.id, title: i.node.title}
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

    const rows = allProds.map((product) => [
        <Checkbox
            checked={selectedItems.includes(product.id)}
            onChange={() => handleCheckboxChange(product.id)}
            label={product.title}
        />,
        product.title,
    ]);

    return (
        <Page title="Add Tags to Products">
            <Card>
                <DataTable
                    columnContentTypes={['text', 'text']}
                    headings={['Select', 'Product Name']}
                    rows={rows}
                />
                <Button onClick={handleTagAddition} disabled={selectedItems.length === 0}>
                    Add Tag
                </Button>
            </Card>
        </Page>
    );
};

export default AppAddTags;