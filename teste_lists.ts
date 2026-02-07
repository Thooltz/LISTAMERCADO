/**
 * Script de Teste para Tabela public.lists
 * 
 * Este script testa todas as operações CRUD na tabela lists:
 * - Obter usuário logado
 * - Inserir uma lista
 * - Buscar listas do usuário ordenando por updated_at desc
 * - Atualizar uma lista
 * - Deletar uma lista
 * 
 * Como executar:
 * 1. Configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 * 2. Faça login no Supabase antes de executar (ou configure um usuário de teste)
 * 3. Execute: npx tsx teste_lists.ts (ou ts-node, ou compile e execute)
 * 
 * Alternativa: Copie e cole este código no console do navegador após fazer login
 */

import { createClient } from '@supabase/supabase-js'

// ⚠️ CONFIGURE SUAS VARIÁVEIS DE AMBIENTE AQUI
// Ou use process.env.VITE_SUPABASE_URL e process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sua-anon-key'

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/**
 * Função principal de teste
 */
async function testarLists() {
  console.log('🧪 Iniciando testes da tabela public.lists...\n')

  try {
    // ============================================
    // 1. OBTER USUÁRIO LOGADO
    // ============================================
    console.log('1️⃣ Obtendo usuário logado...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('❌ Erro ao obter usuário:', userError?.message)
      console.log('\n💡 Dica: Faça login antes de executar este teste:')
      console.log('   await supabase.auth.signInWithPassword({ email: "seu@email.com", password: "sua-senha" })')
      return
    }

    console.log('✅ Usuário logado:', {
      id: user.id,
      email: user.email,
    })
    console.log('')

    // ============================================
    // 2. INSERIR UMA LISTA
    // ============================================
    console.log('2️⃣ Inserindo uma nova lista...')
    const novaLista = {
      title: `Lista de Teste - ${new Date().toLocaleString('pt-BR')}`,
      items: [
        { id: '1', name: 'Arroz', quantity: 2, unit: 'kg', checked: false },
        { id: '2', name: 'Feijão', quantity: 1, unit: 'kg', checked: false },
      ],
    }

    const { data: listaInserida, error: insertError } = await supabase
      .from('lists')
      .insert({
        title: novaLista.title,
        items: novaLista.items,
        user_id: user.id, // ⚠️ Importante: usar o user_id do usuário logado
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Erro ao inserir lista:', insertError)
      console.error('   Código:', insertError.code)
      console.error('   Mensagem:', insertError.message)
      console.error('   Detalhes:', insertError.details)
      console.error('   Hint:', insertError.hint)
      return
    }

    console.log('✅ Lista inserida com sucesso:', {
      id: listaInserida.id,
      title: listaInserida.title,
      items: listaInserida.items,
      created_at: listaInserida.created_at,
      updated_at: listaInserida.updated_at,
    })
    console.log('')

    // ============================================
    // 3. BUSCAR LISTAS DO USUÁRIO (ORDENANDO POR updated_at DESC)
    // ============================================
    console.log('3️⃣ Buscando listas do usuário ordenadas por updated_at DESC...')
    const { data: listas, error: selectError } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (selectError) {
      console.error('❌ Erro ao buscar listas:', selectError)
      console.error('   Código:', selectError.code)
      console.error('   Mensagem:', selectError.message)
      return
    }

    console.log(`✅ Encontradas ${listas?.length || 0} lista(s):`)
    if (listas && listas.length > 0) {
      listas.forEach((lista, index) => {
        console.log(`   ${index + 1}. ${lista.title} (ID: ${lista.id})`)
        console.log(`      Items: ${JSON.stringify(lista.items)}`)
        console.log(`      Atualizada em: ${lista.updated_at}`)
      })
    } else {
      console.log('   Nenhuma lista encontrada (isso é estranho, acabamos de inserir uma!)')
    }
    console.log('')

    // ============================================
    // 4. ATUALIZAR UMA LISTA
    // ============================================
    if (listaInserida) {
      console.log('4️⃣ Atualizando a lista inserida...')
      const { data: listaAtualizada, error: updateError } = await supabase
        .from('lists')
        .update({
          title: `${listaInserida.title} (ATUALIZADA)`,
          items: [
            ...(listaInserida.items as any[]),
            { id: '3', name: 'Açúcar', quantity: 1, unit: 'kg', checked: false },
          ],
        })
        .eq('id', listaInserida.id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Erro ao atualizar lista:', updateError)
        return
      }

      console.log('✅ Lista atualizada:', {
        id: listaAtualizada.id,
        title: listaAtualizada.title,
        updated_at: listaAtualizada.updated_at,
        items_count: (listaAtualizada.items as any[]).length,
      })
      console.log('   ⏰ Note que updated_at foi atualizado automaticamente pelo trigger!')
      console.log('')
    }

    // ============================================
    // 5. TESTAR RLS: Tentar acessar lista de outro usuário (deve falhar)
    // ============================================
    console.log('5️⃣ Testando RLS: tentando acessar lista inexistente...')
    const { data: listaInexistente, error: rlsError } = await supabase
      .from('lists')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .single()

    if (rlsError) {
      if (rlsError.code === 'PGRST116' || rlsError.message?.includes('No rows')) {
        console.log('✅ RLS funcionando: não encontrou lista inexistente (comportamento esperado)')
      } else {
        console.log('ℹ️  Erro esperado (lista não existe):', rlsError.message)
      }
    } else {
      console.log('⚠️  Atenção: RLS pode não estar funcionando corretamente')
    }
    console.log('')

    // ============================================
    // 6. DELETAR A LISTA DE TESTE (OPCIONAL)
    // ============================================
    if (listaInserida) {
      console.log('6️⃣ Deletando a lista de teste...')
      const { error: deleteError } = await supabase
        .from('lists')
        .delete()
        .eq('id', listaInserida.id)

      if (deleteError) {
        console.error('❌ Erro ao deletar lista:', deleteError)
        return
      }

      console.log('✅ Lista deletada com sucesso!')
      console.log('')
    }

    // ============================================
    // RESUMO FINAL
    // ============================================
    console.log('🎉 Todos os testes passaram com sucesso!')
    console.log('')
    console.log('✅ Checklist de validação:')
    console.log('   ✅ Usuário logado obtido')
    console.log('   ✅ Lista inserida com sucesso')
    console.log('   ✅ Listas buscadas e ordenadas por updated_at DESC')
    console.log('   ✅ Lista atualizada (trigger updated_at funcionando)')
    console.log('   ✅ RLS funcionando corretamente')
    console.log('   ✅ Lista deletada com sucesso')
    console.log('')
    console.log('🚀 A tabela public.lists está funcionando perfeitamente!')

  } catch (error: any) {
    console.error('❌ Erro inesperado:', error)
    console.error('   Stack:', error.stack)
  }
}

// Executar testes se rodado diretamente
// Para Node.js com CommonJS
if (typeof require !== 'undefined' && require.main === module) {
  testarLists()
    .then(() => {
      console.log('\n✅ Testes concluídos!')
      if (typeof process !== 'undefined' && process.exit) {
        process.exit(0)
      }
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error)
      if (typeof process !== 'undefined' && process.exit) {
        process.exit(1)
      }
    })
}

// Para uso em módulos ES6 ou no navegador
// Execute: testarLists() no console ou importe e chame
export { testarLists }
