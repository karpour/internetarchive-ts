export function prepareFilesPatch(metadata, sourceMetadata: IaFile, append, target, appendList, insert) {
    const filename = target.replace(/^files\/,'')
    for (const f in sourceMetadata) {
        if f.get('name') == filename:
            sourceMetadata = f
            break
    }
    patch = prepare_patch(metadata, sourceMetadata, append, appendList, insert)
    return patch
}