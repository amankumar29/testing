export const downloadImage = async (
  imageUrl,
  filename = "downloaded_image.png"
) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("There was an error downloading the image:", error);
    throw error; // Rethrow the error if you want to handle it further
  }
};
