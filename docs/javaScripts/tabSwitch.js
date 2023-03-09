/**
 * Created by Devin on 2015-05-07.
 */

function TabSwitch(activeElemNum, number, tabPrefix, contentPrefix)
{
    for (var i = 0; i < number; i++)
    {
        document.getElementById(contentPrefix+i).style.display = 'none';
        document.getElementById(tabPrefix+i).className = '';
    }
    document.getElementById(contentPrefix+activeElemNum).style.display = 'block';
    document.getElementById(tabPrefix+activeElemNum).className = 'active';
}