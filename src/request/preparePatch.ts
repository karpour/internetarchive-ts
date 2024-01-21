export default function preparePatch(
    metadata: Record<string, string>,
    sourceMetadata: Record<string, string | string[]> = {},
     append:boolean, appendList?:boolean, insert?:boolean) {
const destinationMetadata =  structuredClone(sourceMetadata)
if isinstance(metadata, list):
    preparedMetadata = metadata
    if not destinationMetadata:
        destinationMetadata = []
else:
    preparedMetadata = prepare_metadata(metadata, sourceMetadata, append, appendList, insert)
if isinstance(destinationMetadata, dict):
    destinationMetadata.update(preparedMetadata)
elif isinstance(metadata, list) and not destinationMetadata:
    destinationMetadata = metadata
else:
    if isinstance(preparedMetadata, list):
        if appendList:
            destinationMetadata += preparedMetadata
        else:
            destinationMetadata = preparedMetadata
    else:
        destinationMetadata.append(preparedMetadata)
// Delete metadata items where value is REMOVE_TAG.
destinationMetadata = delete_items_from_dict(destinationMetadata, 'REMOVE_TAG')
patch = make_patch(sourceMetadata, destinationMetadata).patch
return patch
    }

