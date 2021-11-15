def convert_document(doc):
    """

    Helper function to convert a firebase document to a python dictionary. Adds an extra field
    containing the firebase document id called `doc_id`.

    :param doc: A firebase document
    :return: content of the document with an extra field containing the document id

    """
    document = doc.to_dict()
    document['doc_id'] = doc.id

    return document
