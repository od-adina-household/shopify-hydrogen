import {
  extension,
  DropZone,
  useBuyerJourneyIntercept,
  useApplyMetafieldChange,
} from '@shopify/checkout-ui-extensions';

extension('checkout.customer-account.render', (root, { api }) => {
  // State to track if proof has been uploaded
  let proofUploaded = false;

  // Intercept checkout progression
  useBuyerJourneyIntercept(async () => {
    if (!proofUploaded) {
      return {
        behavior: 'block',
        reason: {
          title: 'Bank Transfer Proof Required',
          message:
            'Please upload a screenshot of your bank transfer before completing checkout.',
        },
      };
    }
  });

  root.appendChild(
    root.createComponent('View', { padding: 'large' }, [
      root.createComponent('Text', { weight: 'bold' }, 'Bank Transfer Proof Upload'),
      root.createComponent(
        'DropZone',
        {
          accept: 'image/*',
          onDrop: async (files) => {
            const file = files[0];
            if (!file) return;

            // Get presigned upload URL from Hydrogen app
            const uploadUrlResponse = await fetch(
              '/api/r2/upload-url?filename=' +
                encodeURIComponent(file.name) +
                '&contentType=' +
                encodeURIComponent(file.type),
            );
            const { uploadUrl, objectKey } = await uploadUrlResponse.json();

            // Upload file directly to R2
            await fetch(uploadUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            });

            // Store object key in cart metafield
            await api.applyMetafieldChange({
              type: 'updateCartMetafield',
              metafield: {
                namespace: 'bank_transfer',
                key: 'proof_object_key',
                value: objectKey,
                type: 'single_line_text_field',
              },
            });

            proofUploaded = true;
          },
        },
      ),
    ]),
  );
});