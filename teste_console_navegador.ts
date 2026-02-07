// ============================================
// TESTE MÍNIMO: Verificar endpoint /rest/v1/lists
// Cole no Console do Navegador (F12) após fazer login
// ============================================

(async function testeLists() {
  try {
    // 1. Logar VITE_SUPABASE_URL (se disponível)
    console.log('🔍 Verificando configuração...');
    const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || 'https://fwpdpdtdwxgobpenwfes.supabase.co';
    console.log('📍 Supabase URL:', supabaseUrl);
    
    // Obter cliente Supabase (assumindo que está disponível no app)
    // Se não estiver, você precisa importar ou acessar de outra forma
    // Exemplo: const supabase = window.supabase; ou import de algum módulo
    
    // 2. Pegar usuário logado
    console.log('\n1️⃣ Obtendo usuário logado...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Erro ao obter usuário:', userError);
      console.log('💡 Faça login primeiro!');
      return;
    }
    
    console.log('✅ Usuário:', { id: user.id, email: user.email });
    
    // 3. Inserir uma lista
    console.log('\n2️⃣ Inserindo lista...');
    const { data: listaInserida, error: insertError } = await supabase
      .from('lists')
      .insert({
        title: `Teste ${new Date().toISOString()}`,
        items: [],
        user_id: user.id
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
      console.error('   Código:', insertError.code);
      console.error('   Mensagem:', insertError.message);
      console.error('   Status:', insertError.status);
      console.error('   Detalhes:', insertError.details);
      
      if (insertError.code === 'PGRST116' || insertError.message?.includes('relation') || insertError.status === 404) {
        console.error('\n🔴 PROBLEMA: Tabela não encontrada (404)');
        console.error('   → Execute o SQL de criação no Supabase SQL Editor');
        console.error('   → Aguarde 10-15 segundos');
        console.error('   → Execute: NOTIFY pgrst, \'reload schema\';');
      }
      return;
    }
    
    console.log('✅ Lista inserida:', listaInserida);
    
    // 4. Selecionar listas ordenadas por updated_at DESC
    console.log('\n3️⃣ Buscando listas ordenadas por updated_at DESC...');
    const { data: listas, error: selectError } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (selectError) {
      console.error('❌ Erro ao buscar:', selectError);
      return;
    }
    
    console.log(`✅ Encontradas ${listas?.length || 0} lista(s):`);
    listas?.forEach((lista, i) => {
      console.log(`   ${i + 1}. ${lista.title} (ID: ${lista.id})`);
      console.log(`      Items: ${JSON.stringify(lista.items)}`);
      console.log(`      Updated: ${lista.updated_at}`);
    });
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
})();

// ============================================
// VERSÃO SIMPLIFICADA (se supabase já estiver disponível)
// ============================================

/*
(async function testeRapido() {
  // 1. Logar URL
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL || 'Não encontrada');
  
  // 2. Pegar usuário
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Usuário:', user?.id);
  
  // 3. Inserir
  const { data, error } = await supabase
    .from('lists')
    .insert({ title: 'Teste', items: [], user_id: user.id })
    .select()
    .single();
  
  if (error) {
    console.error('Erro:', error.code, error.message);
    if (error.status === 404) {
      console.error('🔴 404: Tabela não encontrada ou schema não exposto');
    }
  } else {
    console.log('✅ Sucesso:', data);
  }
  
  // 4. Buscar ordenado
  const { data: listas } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  
  console.log('Listas:', listas);
})();
*/
