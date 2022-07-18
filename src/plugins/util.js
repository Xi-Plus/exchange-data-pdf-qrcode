export function idx2key(idx) {
	let res = ''
	while (idx >= 0) {
		res = String.fromCharCode(97 + idx % 26) + res;
		idx = Math.floor(idx / 26) - 1;
	}
	return res
}

export const formKeys = [
	'name',
	'national_id',
	'birthday',
	'gender',
	'address',
	'phone',
]
