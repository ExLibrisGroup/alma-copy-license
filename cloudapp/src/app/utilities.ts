/**
 * Downloads a file
 * @param filename 
 * @param filetype Mimetype
 * @param contents Contents in base64 format
 */
const download = (filename: string, filetype: string, contents: string) => {
  var element = document.createElement('a');
  element.setAttribute('href', `data:${filetype};base64,` + contents);
  element.setAttribute('download', `${filename}`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export { download };