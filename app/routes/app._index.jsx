import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  ActionList,
  Popover

} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  return (
    <Card>
      <BlockStack gap="400" align="start">
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Product Tag Editor
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Liquid tags are used to define logic that tells templates what to do.
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            I use product tags often as a way to conditionally display UI on product or collection pages. For example, maybe I want to show
            a 'Best Seller' or 'On Sale' badge.
          </Text>
        </BlockStack>
        <Button url="/app/addTags" variant="primary">Manage Tags</Button>
      </BlockStack>
    </Card>
  );
}
