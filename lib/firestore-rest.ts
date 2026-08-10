const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lead-management-d3cab";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA9lFm08_Fc1LLT4DblkAD7Ew08w2UwzAE";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestoreValue(val: any): any {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
        return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
        return { arrayValue: { values: val.map(toFirestoreValue) } };
    }
    if (typeof val === 'object') {
        const fields: Record<string, any> = {};
        for (const [k, v] of Object.entries(val)) {
            fields[k] = toFirestoreValue(v);
        }
        return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
}

function fromFirestoreValue(val: any): any {
    if (!val) return null;
    if ('stringValue' in val) return val.stringValue;
    if ('integerValue' in val) return parseInt(val.integerValue, 10);
    if ('doubleValue' in val) return parseFloat(val.doubleValue);
    if ('booleanValue' in val) return val.booleanValue;
    if ('nullValue' in val) return null;
    if ('arrayValue' in val) {
        return (val.arrayValue.values || []).map(fromFirestoreValue);
    }
    if ('mapValue' in val) {
        const res: Record<string, any> = {};
        const fields = val.mapValue.fields || {};
        for (const [k, v] of Object.entries(fields)) {
            res[k] = fromFirestoreValue(v);
        }
        return res;
    }
    return null;
}

function getHeaders(authToken?: string) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

export async function addFirestoreDoc(collection: string, data: Record<string, any>, token?: string): Promise<string> {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
        fields[k] = toFirestoreValue(v);
    }

    const url = `${BASE_URL}/${collection}?key=${API_KEY}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
        const errText = await res.text();
        if (res.status === 403 || errText.includes('PERMISSION_DENIED')) {
            throw new Error(`Firestore Permission Denied (403): Please check your Firebase Console (project lead-management-d3cab) > Firestore Database > Rules. Update rules to allow read/write (e.g. "allow read, write: if request.auth != null;" or "allow read, write: if true;").`);
        }
        throw new Error(`Firestore addDoc error (${res.status}): ${errText}`);
    }

    const json = await res.json();
    const parts = json.name.split('/');
    return parts[parts.length - 1];
}

export async function queryFirestoreDocs(collection: string, field: string, value: string, token?: string): Promise<any[]> {
    const url = `${BASE_URL}:runQuery?key=${API_KEY}`;
    const queryBody = {
        structuredQuery: {
            from: [{ collectionId: collection }],
            where: {
                fieldFilter: {
                    field: { fieldPath: field },
                    op: 'EQUAL',
                    value: { stringValue: value },
                },
            },
        },
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(queryBody),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.warn('Firestore query non-ok status:', res.status, errText);
        return [];
    }

    const results = await res.json();
    if (!Array.isArray(results)) return [];

    return results
        .filter((item: any) => item.document)
        .map((item: any) => {
            const docName = item.document.name;
            const parts = docName.split('/');
            const id = parts[parts.length - 1];
            const fields = item.document.fields || {};
            const data: Record<string, any> = { id };
            for (const [k, v] of Object.entries(fields)) {
                data[k] = fromFirestoreValue(v);
            }
            return data;
        });
}

export async function deleteFirestoreDoc(collection: string, docId: string, token?: string): Promise<void> {
    const url = `${BASE_URL}/${collection}/${docId}?key=${API_KEY}`;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(token),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.warn(`Firestore deleteDoc status (${res.status}):`, errText);
    }
}
