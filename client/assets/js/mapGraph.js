'use strict';
/**
 * Graph representing each region of the map.
 * Each region is a node, and links to adjacent regions
 */
var MapGraph = function() {
	return {
		'alaska': {
			link: ['kamchatka', 'northwest', 'alberta'],
			continent: 'northamerica'
		},
		'northwest': {
			link: ['alaska', 'alberta', 'ontario', 'greenland'],
			continent: 'northamerica'
		},
		'alberta': {
			link: ['alaska', 'northwest', 'ontario', 'westernuuee'],
			continent: 'northamerica'
		}/*,
		'greenland': {
			link: ['northwest', 'ontario', 'quebec', 'iceland'],
			continent: 'northamerica'
		},
		'ontario': {
			link: ['northwest', 'alberta', 'westernuuee', 'easternuuee', 'quebec', 'greenland'],
			continent: 'northamerica'
		},
		'quebec': {
			link: ['ontario', 'easternuuee', 'greenland'],
			continent: 'northamerica'
		},
		'westernuuee': {
			link: ['alberta', 'ontario', 'easternuuee', 'centralamerica'],
			continent: 'northamerica'
		},
		'easternuuee': {
			link: ['centralamerica', 'westernuuee', 'ontario', 'quebec'],
			continent: 'northamerica'
		},
		'centralamerica': {
			link: ['westernuuee', 'easternuuee', 'venezuela'],
			continent: 'northamerica'
		},
		'venezuela': {
			link: ['centralamerica', 'peru', 'brazil'],
			continent: 'southamerica'
		},
		'peru': {
			link: ['venezuela', 'brazil', 'argentina'],
			continent: 'southamerica'
		},
		'brazil': {
			link: ['venezuela', 'peru', 'argentina', 'northafrica'],
			continent: 'southamerica'
		},
		'argentina': {
			link: ['peru', 'brazil'],
			continent: 'southamerica'
		},
		'northafrica': {
			link: ['brazil', 'westerneurope', 'southerneurope', 'egypt', 'eastafrica', 'congo'],
			continent: 'africa'
		},
		'egypt': {
			link: ['northafrica', 'eastafrica', 'southerneurope', 'middleeast'],
			continent: 'africa'
		},
		'eastafrica': {
			link: ['northafrica', 'middleeast', 'egypt', 'congo', 'southafrica', 'madagascar'],
			continent: 'africa'
		},
		'congo': {
			link: ['northafrica', 'eastafrica', 'southafrica'],
			continent: 'africa'
		},
		'southafrica': {
			link: ['congo', 'eastafrica', 'madagascar'],
			continent: 'africa'
		},
		'madagascar': {
			link: ['southafrica', 'eastafrica'],
			continent: 'africa'
		},
		'iceland': {
			link: ['greenland', 'scandinavia', 'greatbritain'],
			continent: 'europe'
		},
		'scandinavia': {
			link: ['iceland', 'greatbritain', 'northerneurope', 'ukraine'],
			continent: 'europe'
		},
		'ukraine': {
			link: ['scandinavia', 'northerneurope', 'southerneurope', 'middleeast', 'afghanistan', 'ural'],
			continent: 'europe'
		},
		'greatbritain': {
			link: ['iceland', 'scandinavia', 'westerneurope', 'northerneurope'],
			continent: 'europe'
		},
		'westerneurope': {
			link: ['greatbritain', 'northerneurope', 'southerneurope', 'northafrica'],
			continent: 'europe'
		},
		'northerneurope': {
			link: ['greatbritain', 'scandinavia', 'ukraine', 'westerneurope', 'southerneurope'],
			continent: 'europe'
		},
		'southerneurope': {
			link: ['westerneurope', 'northerneurope', 'ukraine', 'middleeast', 'egypt', 'northafrica'],
			continent: 'europe'
		},
		'middleeast': {
			link: ['egypt', 'eastafrica', 'southerneurope', 'ukraine', 'afghanistan', 'india'],
			continent: 'asia'
		},
		'afghanistan': {
			link: ['ukraine', 'middleeast', 'ural', 'china', 'india'],
			continent: 'asia'
		},
		'ural': {
			link: ['ukraine', 'afghanistan', 'china', 'siberia'],
			continent: 'asia'
		},
		'siberia': {
			link: ['ural', 'china', 'mongolia', 'irkutsk', 'yakustk'],
			continent: 'asia'
		},
		'yakustk': {
			link: ['siberia', 'irkutsk', 'kamchatka'],
			continent: 'asia'
		},
		'irkutsk': {
			link: ['siberia', 'yakustk', 'kamchatka', 'mongolia'],
			continent: 'asia'
		},
		'kamchatka': {
			link: ['alaska', 'yakustk', 'irkutsk', 'mongolia', 'japan'],
			continent: 'asia'
		},
		'mongolia': {
			link: ['china', 'siberia', 'irkutsk', 'kamchatka', 'japan'],
			continent: 'asia'
		},
		'japan': {
			link: ['kamchatka', 'mongolia'],
			continent: 'asia'
		},
		'china': {
			link: ['siam', 'india', 'afghanistan', 'ural', 'siberia', 'mongolia'],
			continent: 'asia'
		},
		'india': {
			link: ['middleeast', 'afghanistan', 'china', 'siam'],
			continent: 'asia'
		},
		'siam': {
			link: ['china', 'india', 'indonesia'],
			continent: 'asia'
		},
		'indonesia': {
			link: ['siam', 'newguinea', 'westernaustralia'],
			continent: 'oceania'
		},
		'newguinea': {
			link: ['indonesia', 'westernaustralia', 'easternaustralia'],
			continent: 'oceania'
		},
		'westernaustralia': {
			link: ['indonesia', 'newguinea', 'easternaustralia'],
			continent: 'oceania'
		},
		'easternaustralia': {
			link: ['westernaustralia', 'newguinea'],
			continent: 'oceania'
		}*/
	}
};
