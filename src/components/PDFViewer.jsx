const PDFViewer = ({ documentData }) => {
  if (!documentData?.base64) return <div>No PDF loaded</div>;

  const pdfDataUri = `data:application/pdf;base64,${documentData.base64}`;

  return (
    <div className="h-full">
      <iframe
        src={pdfDataUri}
        className="w-full h-full"
        title="PDF Viewer"
      />
    </div>
  );
};

export default PDFViewer;