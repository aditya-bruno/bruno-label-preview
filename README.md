# Bruno Label Preview

Preview shipping labels (PDF and ZPL) returned by carrier, warehouse and logistics APIs directly in Bruno, without copying base64 out of the response and decoding it in another tool.

This is a workaround for [usebruno/bruno#9601](https://github.com/usebruno/bruno/issues/9601) using a post-response script and Bruno's built-in `bru.visualize`. No changes to Bruno are needed.

## What it does

The script looks through the whole response for a label and shows it in a **Label** view:

| Response | Result |
|---|---|
| PDF as base64 inside JSON | Label preview |
| PDF as base64 inside XML (for example a SOAP `<GraphicImage>`) | Label preview |
| ZPL as base64 inside JSON | Label image |
| Raw ZPL (`^XA ... ^XZ`) | Label image |
| Raw PDF (whole response is a PDF) | Uses Bruno's built-in preview, the script does nothing |
| No label | "No PDF or ZPL label found in this response." |

It doesn't depend on field names, so it works whatever the label field is called.

## What's in this repo

```
label-preview.js        The post-response script (copy this into your own collection)
collection/             A ready-to-open Bruno collection with the script already set up
server/label_server.js  A small local server that returns sample labels, for trying it out
```

## Try it out

Requirements: [Bruno](https://www.usebruno.com/) and [Node.js](https://nodejs.org/).

1. Start the sample server:

   ```
   node server/label_server.js
   ```

   You should see `label server on http://localhost:8010`.

2. In Bruno, choose **Open Collection** and select the `collection` folder.

3. Open any request and click **Send**.

4. In the response format dropdown (next to the status), choose **Label**.

The sample label uses a made-up name and address.

| Request | Expected |
|---|---|
| 1 PDF label in JSON | "SHIP TO: Jane Doe" label |
| 2 PDF label in XML | Same label |
| 3 ZPL label in JSON | Label with name, address and barcode |
| 4 Raw ZPL label | Same ZPL label |
| 5 Raw PDF label | Bruno's built-in PDF preview |
| 6 No label | "No PDF or ZPL label found in this response." |

## Use it with your own API

1. Open `label-preview.js` and copy its contents.
2. In your collection, open the **collection** or **folder** settings, then **Script** > **Post Response**, and paste it. Every request inside will get the Label view.
3. Send a request that returns a label and choose **Label** in the response format dropdown.

You can also paste it into a single request's Post Response script.


## Background

Native label preview for Bruno is discussed in [usebruno/bruno#9601](https://github.com/usebruno/bruno/issues/9601), with a proposed implementation in [usebruno/bruno#9608](https://github.com/usebruno/bruno/pull/9608). This repo is a stopgap until that's decided.
