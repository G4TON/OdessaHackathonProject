import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

async function testUpload() {
  console.log('\n--- TESTING REAL PDF GENERATION & PARSER ---');

  // Create a genuine, valid multi-paragraph PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const textLines = [
    'Operating System Process Management and CPU Scheduling',
    'Processes represent programs in execution with code, data, heap, and stack segments.',
    'The Operating System manages states: New, Ready, Running, Waiting, and Terminated.',
    'CPU Scheduling algorithms include First-Come First-Served, Round Robin, and Priority Scheduling.',
    'Context switching incurs architectural overhead by saving CPU registers and memory mappings.',
    'Preemptive scheduling interrupts tasks when a higher priority process arrives or time quantum expires.'
  ];

  let y = 350;
  for (const line of textLines) {
    page.drawText(line, {
      x: 50,
      y,
      size: 11,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 40;
  }

  const pdfBytes = await pdfDoc.save();
  const samplePdf = Buffer.from(pdfBytes);

  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="Operating_Systems_Scheduling.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
    samplePdf,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const res = await fetch('http://localhost:3001/api/documents/upload', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  const json = await res.json();
  console.log('Upload response:', json);

  if (json.success) {
    console.log('✓ Successfully uploaded and extracted valid PDF!');
    console.log(`✓ Document title: ${json.document.title}`);
    console.log(`✓ Generated ${json.topicsCount} topics.`);
  } else {
    throw new Error(`PDF upload failed: ${json.error}`);
  }
}

testUpload().catch((err) => {
  console.error('PDF upload test failed:', err);
  process.exit(1);
});
