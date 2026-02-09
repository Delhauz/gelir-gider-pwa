let data = JSON.parse(localStorage.getItem("data")) || [];
let rangeChart;

function add(){
  const d = document.getElementById("date").value;
  const desc = document.getElementById("desc").value;
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  if(!d||!desc||!amount){alert("Eksik bilgi"); return;}
  data.push({id: Date.now(), date:d, desc, amount, type});
  save();
}

function save(){
  localStorage.setItem("data", JSON.stringify(data));
  render();
}

function removeItem(id){
  if(!confirm("Silinsin mi?")) return;
  data = data.filter(d=>d.id!==id);
  save();
}

function editItem(id){
  const item = data.find(d=>d.id===id);
  const newDesc = prompt("Açıklama", item.desc);
  const newAmount = prompt("Tutar", item.amount);
  if(newDesc===null||newAmount===null) return;
  item.desc = newDesc; item.amount = Number(newAmount);
  save();
}

function render(){
  const start = document.getElementById("startDate").value ? new Date(document.getElementById("startDate").value) : null;
  const end = document.getElementById("endDate").value ? new Date(document.getElementById("endDate").value) : null;

  document.getElementById("expenseList").innerHTML = "";
  document.getElementById("incomeList").innerHTML = "";
  let expenseTotal=0, incomeTotal=0;

  const filtered = data.filter(d=>{
    const dt = new Date(d.date);
    if(start && dt < start) return false;
    if(end && dt > end) return false;
    return true;
  }).sort((a,b)=>new Date(a.date)-new Date(b.date));

  filtered.forEach(d=>{
    const row = `<tr>
      <td>${new Date(d.date).toLocaleDateString()}</td>
      <td><input type="checkbox" class="selectRow" data-id="${d.id}"></td>
      <td>${d.desc}</td>
      <td>${d.amount}</td>
      <td>
        <button onclick="editItem(${d.id})">✏️</button>
        <button onclick="removeItem(${d.id})">🗑️</button>
      </td>
    </tr>`;
    if(d.type==="expense"){document.getElementById("expenseList").innerHTML += row; expenseTotal+=d.amount;}
    else{document.getElementById("incomeList").innerHTML += row; incomeTotal+=d.amount;}
  });

  document.getElementById("expenseTotal").textContent = expenseTotal;
  document.getElementById("incomeTotal").textContent = incomeTotal;
  document.getElementById("expenseTotalBox").textContent = expenseTotal;
  document.getElementById("incomeTotalBox").textContent = incomeTotal;

  drawRangeChart(start,end);
}

function getSelectedIds(){
  return Array.from(document.querySelectorAll(".selectRow:checked")).map(cb=>Number(cb.dataset.id));
}

function deleteSelected(){
  const ids = getSelectedIds();
  if(!ids.length){alert("Hiç seçilmedi"); return;}
  if(!confirm(`${ids.length} satır silinsin mi?`)) return;
  data = data.filter(d=>!ids.includes(d.id));
  save();
}

function editSelected(){
  const ids = getSelectedIds();
  if(!ids.length){alert("Hiç seçilmedi"); return;}
  ids.forEach(id=>editItem(id));
}

function drawRangeChart(start,end){
  const filtered = data.filter(d=>{
    const dt = new Date(d.date);
    if(start && dt < start) return false;
    if(end && dt > end) return false;
    return true;
  });

  const map = {};
  filtered.forEach(d=>{
    if(!map[d.date]) map[d.date]={income:0, expense:0};
    map[d.date][d.type] += d.amount;
  });

  const labels = Object.keys(map).sort();
  const incomeData = labels.map(l=>map[l].income);
  const expenseData = labels.map(l=>map[l].expense);

  if(rangeChart) rangeChart.destroy();
  const ctx = document.getElementById("rangeChart").getContext("2d");
  rangeChart = new Chart(ctx,{
    type:'bar',
    data:{
      labels,
      datasets:[
        {label:"Gelir", data:incomeData, backgroundColor:'green'},
        {label:"Gider", data:expenseData, backgroundColor:'red'}
      ]
    }
  });
}

function downloadPDF(){
  const element = document.querySelector('.tables');
  html2pdf().set({
    margin:1,
    filename:'GelirGiderRaporu.pdf',
    image:{type:'jpeg', quality:0.98},
    html2canvas:{scale:2},
    jsPDF:{unit:'cm', format:'a4', orientation:'portrait'}
  }).from(element).save();
}

render();
